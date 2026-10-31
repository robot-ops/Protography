import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import { query } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const STRIPE_SECRET_KEY = (process.env.STRIPE_SECRET_KEY || process.env.STRIPE_KEY || '').trim();
const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');

// Fail fast if required security secrets are missing
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set in environment variables (.env)!');
  process.exit(1);
}

// Initialize Stripe SDK if key is provided
let stripe = null;
if (STRIPE_SECRET_KEY) {
  stripe = new Stripe(STRIPE_SECRET_KEY);
  console.log('✓ Stripe SDK initialized successfully');
} else {
  console.warn('⚠️ WARNING: STRIPE_SECRET_KEY is not set yet. Checkout and webhooks will be disabled.');
}

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
}));

// Normalize multiple consecutive slashes (e.g. //api/... -> /api/...)
app.use((req, res, next) => {
  req.url = req.url.replace(/\/{2,}/g, '/');
  next();
});

// =========================================================================
// STRIPE WEBHOOK ROUTE (Must receive raw body before express.json() is applied)
// =========================================================================
app.post(
  '/api/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured on the server' });
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();

    let event;
    try {
      if (webhookSecret && sig) {
        // Cryptographically verify signature from Stripe
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } else {
        // Parse payload directly if testing without a configured webhook secret
        event = JSON.parse(req.body.toString());
      }
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Only this webhook event is allowed to mark an order as "paid"
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      console.log(`[Webhook] Payment completed for Stripe session: ${session.id}, Order ID: ${orderId}`);

      if (orderId) {
        try {
          await query(
            "UPDATE orders SET status = 'paid', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
            [orderId]
          );
          console.log(`[Webhook] ✓ Order #${orderId} marked as PAID in database`);
        } catch (dbErr) {
          console.error(`[Webhook] Failed to update order #${orderId}:`, dbErr.message);
          return res.status(500).json({ error: 'Database update failed' });
        }
      }
    }

    res.json({ received: true });
  }
);

// General JSON body parser for all other API routes
app.use(express.json());

// =========================================================================
// AUTHENTICATION MIDDLEWARE
// =========================================================================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access denied: Please sign in' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session. Please sign in again' });
    }
    req.user = decodedUser;
    next();
  });
}

// =========================================================================
// PUBLIC & PORTFOLIO ROUTES
// =========================================================================

// 1. Healthcheck Route (Public)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Protography backend is running smoothly',
    stripeConfigured: !!stripe,
  });
});

// 2. Portfolio Route: Protected - Requires Valid User Login
app.get('/api/portfolio', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, image, alt, category, price FROM portfolios ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching portfolio:', error.message);
    res.status(500).json({ error: 'Failed to fetch portfolio data from database' });
  }
});

// =========================================================================
// AUTHENTICATION ROUTES
// =========================================================================

// User Registration
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email.toLowerCase(), hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user,
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Session Verification (Survives page refresh)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT id, name, email FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Session verification error:', error.message);
    res.status(500).json({ error: 'Failed to verify session' });
  }
});

// =========================================================================
// STRIPE CHECKOUT & ORDERS ROUTES (Assignment 4)
// =========================================================================

// Create Stripe Checkout Session (Locked behind login; prices looked up strictly from DB)
app.post('/api/checkout', authenticateToken, async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured on the server' });
  }

  const { portfolioId } = req.body;

  if (!portfolioId) {
    return res.status(400).json({ error: 'portfolioId is required' });
  }

  try {
    // 1. Look up the product's real price directly from database (Never trust price from browser!)
    const productResult = await query(
      'SELECT id, image, alt, category, price FROM portfolios WHERE id = $1',
      [portfolioId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }

    const portfolioItem = productResult.rows[0];
    const realPrice = portfolioItem.price; // Stored in cents (e.g. 2500 = $25.00)

    // 2. Create the order record in database with initial status 'pending'
    const orderResult = await query(
      'INSERT INTO orders (user_id, status, total_amount) VALUES ($1, $2, $3) RETURNING id',
      [req.user.id, 'pending', realPrice]
    );
    const orderId = orderResult.rows[0].id;

    // 3. Create the order_items record
    await query(
      'INSERT INTO order_items (order_id, portfolio_id, price, quantity) VALUES ($1, $2, $3, $4)',
      [orderId, portfolioItem.id, realPrice, 1]
    );

    // 4. Resolve client base URL for redirect
    const requestOrigin = (req.headers.origin || CLIENT_URL).replace(/\/+$/, '');

    // 5. Create a Stripe Checkout Session (Dynamic Payment Methods enabled)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${portfolioItem.alt} (Fine Art Print)`,
              description: `Category: ${portfolioItem.category} — Archival Quality Photography Print`,
            },
            unit_amount: realPrice,
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: orderId.toString(),
        userId: req.user.id.toString(),
        portfolioId: portfolioItem.id.toString(),
      },
      success_url: `${requestOrigin}/success?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${requestOrigin}/#portfolio`,
    });

    // 6. Save the stripe_session_id on the order
    await query(
      'UPDATE orders SET stripe_session_id = $1 WHERE id = $2',
      [session.id, orderId]
    );

    console.log(`[Checkout] Session created for Order #${orderId}, total: $${(realPrice / 100).toFixed(2)}`);

    // 7. Return the hosted Stripe checkout URL to redirect the user
    res.json({
      url: session.url,
      orderId,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
});

// Order Lookup Endpoint (Used by Success page to verify payment status)
app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `SELECT o.id, o.status, o.total_amount, o.stripe_session_id, o.created_at, o.updated_at,
              oi.price, oi.quantity, p.image, p.alt, p.category
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN portfolios p ON p.id = oi.portfolio_id
       WHERE o.id = $1 AND o.user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const row = result.rows[0];

    // If order is still pending in local DB, check directly with Stripe API
    // (Crucial for localhost testing where Stripe cloud webhook cannot reach private localhost IP)
    if (row.status === 'pending' && row.stripe_session_id && stripe) {
      try {
        const stripeSession = await stripe.checkout.sessions.retrieve(row.stripe_session_id);
        if (stripeSession.payment_status === 'paid') {
          await query(
            "UPDATE orders SET status = 'paid', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
            [row.id]
          );
          row.status = 'paid';
          console.log(`[Order Verify] ✓ Order #${row.id} confirmed as PAID via Stripe session check`);
        }
      } catch (stripeErr) {
        console.error('[Order Verify] Failed to check Stripe session:', stripeErr.message);
      }
    }

    res.json({
      order: {
        id: row.id,
        status: row.status,
        totalAmount: row.total_amount,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        item: {
          image: row.image,
          alt: row.alt,
          category: row.category,
          price: row.price,
          quantity: row.quantity,
        },
      },
    });
  } catch (error) {
    console.error('Order lookup error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve order' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Protography server running on http://localhost:${PORT}`);
});
