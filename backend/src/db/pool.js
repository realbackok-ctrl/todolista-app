'use strict';

const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('[ERROR] DATABASE_URL environment variable is not set. Database connection will fail.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };
