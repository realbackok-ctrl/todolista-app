'use strict';

const { query } = require('../db/pool');

const userRepository = {
  async findByEmail(email) {
    const result = await query(
      'SELECT id, email, password, created_at FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await query(
      'SELECT id, email, password, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async createUser({ email, hashedPassword }) {
    const result = await query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, hashedPassword]
    );
    return result.rows[0];
  },

  async deleteUser(id) {
    await query('DELETE FROM users WHERE id = $1', [id]);
  },

  async updatePassword(id, hashedPassword) {
    await query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
  },
};

module.exports = userRepository;
