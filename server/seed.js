import bcrypt from 'bcryptjs';
import { pool, query } from './db.js';

const portfolioSeedData = [
  {
    image: "/images/portfolio1.jpg",
    alt: "Misty Mountain Ridges - Landscape Series",
    category: "Landscape",
  },
  {
    image: "/images/portfolio2.jpg",
    alt: "Natural Light Portrait - Portrait Study",
    category: "Portrait",
  },
  {
    image: "/images/portfolio4.jpg",
    alt: "Serene Coastal Tides - Nature Essay",
    category: "Landscape",
  },
  {
    image: "/images/portfolio5.jpg",
    alt: "Intimate Connection - Couples Series",
    category: "Couples",
  },
  {
    image: "/images/portfolio6.jpg",
    alt: "Nocturnal Metropolis - Night City Series",
    category: "Night City",
  },
  {
    image: "/images/portfolio7.jpg",
    alt: "Twilight Walk - Couples Stories",
    category: "Couples",
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

    // 2. Create portfolios table if not exists
    await query(`
      CREATE TABLE IF NOT EXISTS portfolios (
        id SERIAL PRIMARY KEY,
        image VARCHAR(255) NOT NULL,
        alt VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Portfolios table ready');

    // 3. Seed portfolio data if empty
    const existingPortfolios = await query('SELECT COUNT(*) FROM portfolios');
    if (parseInt(existingPortfolios.rows[0].count, 10) === 0) {
      for (const item of portfolioSeedData) {
        await query(
          'INSERT INTO portfolios (image, alt, category) VALUES ($1, $2, $3)',
          [item.image, item.alt, item.category]
        );
      }
      console.log(`✓ Inserted ${portfolioSeedData.length} portfolio items successfully`);
    } else {
      console.log('ℹ Portfolio table already contains data, skipping insert');
    }

    // 4. Create default demo user if not exists
    const existingDemoUser = await query('SELECT id FROM users WHERE email = $1', ['demo@protography.com']);
    if (existingDemoUser.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)',
        ['Demo Photographer', 'demo@protography.com', hashedPassword]
      );
      console.log('✓ Demo user ready (email: demo@protography.com, password: password123)');
    }

    console.log('--- Database seeding completed successfully! ---');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  } finally {
    await pool.end();
  }
}

seed();
