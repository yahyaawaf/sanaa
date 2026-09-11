require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// إعداد اتصال PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// إنشاء الجدول عند التشغيل
const initializeDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visitor_count (
        id SERIAL PRIMARY KEY,
        page_path VARCHAR(255) NOT NULL,
        count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(page_path)
      );
    `);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  }
};

// API Routes
app.post('/api/visitors', async (req, res) => {
  const { page } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO visitor_count (page_path, count)
      VALUES ($1, 1)
      ON CONFLICT (page_path) 
      DO UPDATE SET count = visitor_count.count + 1, updated_at = CURRENT_TIMESTAMP
      RETURNING count
    `, [page || '/']);

    res.json({ count: result.rows[0].count });
  } catch (err) {
    console.error('Error updating visitor count:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/visitors', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT count FROM visitor_count WHERE page_path = $1',
      [req.query.page || '/']
    );

    res.json({ count: (result.rows[0] && result.rows[0].count) || 0 });
  } catch (err) {
    console.error('Error fetching visitor count:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve frontend (صفحة الويب)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize and start server
initializeDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
