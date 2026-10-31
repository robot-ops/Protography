import bcrypt from 'bcryptjs';
import { pool, query } from './db.js';

const portfolioSeedData = [
  {
    image: "/images/portfolio1.jpg",
    alt: "Misty Mountain Ridges - Landscape Series",
    category: "Landscape",
    price: 2500, // $25.00
  },
  {
    image: "/images/portfolio2.jpg",
    alt: "Natural Light Portrait - Portrait Study",
    category: "Portrait",
    price: 2000, // $20.00
  },
  {
    image: "/images/portfolio4.jpg",
    alt: "Serene Coastal Tides - Nature Essay",
    category: "Landscape",
    price: 3000, // $30.00
  },
  {
    image: "/images/portfolio5.jpg",
    alt: "Intimate Connection - Couples Series",
    category: "Couples",
    price: 2200, // $22.00
  },
  {
    image: "/images/portfolio6.jpg",
    alt: "Nocturnal Metropolis - Night City Series",
    category: "Night City",
    price: 3500, // $35.00
  },
  {
    image: "/images/portfolio7.jpg",
    alt: "Twilight Walk - Couples Stories",
    category: "Couples",
    price: 2800, // $28.00
  },
];

async function seed() {
  console.log('--- Starting Database Setup & Seeder ---');

  try {
    // 1. Create users table if not exists
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Users table ready');

    // 2. Create portfolios table if not exists, and add price column if missing
    await query(`
      CREATE TABLE IF NOT EXISTS portfolios (
        id SERIAL PRIMARY KEY,
        image VARCHAR(255) NOT NULL,
        alt VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price INT NOT NULL DEFAULT 1500,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await query(`
      ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS price INT NOT NULL DEFAULT 1500;
    `);
    console.log('✓ Portfolios table ready (with price column)');

    // 3. Create orders table if not exists
    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        stripe_session_id VARCHAR(255),
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        total_amount INT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Orders table ready');

    // 4. Create order_items table if not exists
    await query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        portfolio_id INT REFERENCES portfolios(id) ON DELETE SET NULL,
        price INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1
      );
    `);
    console.log('✓ Order_items table ready');

    // 5. Seed portfolio data if empty or update prices
    const existingPortfolios = await query('SELECT COUNT(*) FROM portfolios');
    if (parseInt(existingPortfolios.rows[0].count, 10) === 0) {
      for (const item of portfolioSeedData) {
        await query(
          'INSERT INTO portfolios (image, alt, category, price) VALUES ($1, $2, $3, $4)',
          [item.image, item.alt, item.category, item.price]
        );
      }
      console.log(`✓ Inserted ${portfolioSeedData.length} portfolio items with prices`);
    } else {
      // Update existing portfolio items with corresponding prices
      for (const item of portfolioSeedData) {
        await query(
          'UPDATE portfolios SET price = $1 WHERE image = $2',
          [item.price, item.image]
        );
      }
      console.log('✓ Updated print prices for existing portfolio items');
    }

    // 6. Create default demo user if not exists
    const existingDemoUser = await query('SELECT id FROM users WHERE email = $1', ['demo@protography.com']);
    if (existingDemoUser.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)',
        ['Demo Photographer', 'demo@protography.com', hashedPassword]
      );
      console.log('✓ Demo user ready (email: demo@protography.com, password: password123)');
    }

    console.log('--- Database setup and seeding completed successfully! ---');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  } finally {
    await pool.end();
  }
}

seed();
