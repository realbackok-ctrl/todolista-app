'use strict';

const { query } = require('../db/pool');

const categoryRepository = {
  async findAllByUserId(userId) {
    const result = await query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );
    return result.rows;
  },

  async findById(id) {
    const result = await query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findByIdAndUserId(id, userId) {
    const result = await query(
      'SELECT * FROM categories WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0] || null;
  },

  async findByUserIdAndName(userId, name) {
    const result = await query(
      'SELECT * FROM categories WHERE user_id = $1 AND name = $2',
      [userId, name]
    );
    return result.rows[0] || null;
  },

  async create({ userId, name }) {
    const result = await query(
      'INSERT INTO categories (user_id, name) VALUES ($1, $2) RETURNING *',
      [userId, name]
    );
    return result.rows[0];
  },

  async update(id, { name }) {
    const result = await query(
      'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    return result.rows[0] || null;
  },

  async deleteById(id) {
    await query('DELETE FROM categories WHERE id = $1', [id]);
  },
};

module.exports = categoryRepository;
