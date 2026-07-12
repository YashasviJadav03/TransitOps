const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'transitops',
  port: process.env.POSTGRES_PORT || 5432,
});

pool.query('SELECT NOW()')
  .then(res => {
    console.log('Database connected successfully:', res.rows[0].now);
    pool.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
