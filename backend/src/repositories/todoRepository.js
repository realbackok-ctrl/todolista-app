'use strict';

const { query } = require('../db/pool');

const todoRepository = {
  async findAllByUserId(userId, { status, categoryId } = {}) {
    const params = [userId];
    const conditions = ['user_id = $1'];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (categoryId) {
      params.push(categoryId);
      conditions.push(`category_id = $${params.length}`);
    }

    const sql = `SELECT * FROM todos WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`;
    const result = await query(sql, params);
    return result.rows;
  },

  async findById(id) {
    const result = await query('SELECT * FROM todos WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findByIdAndUserId(id, userId) {
    const result = await query(
      'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0] || null;
  },

  async create({ userId, title, description, categoryId, dueDate }) {
    const result = await query(
      `INSERT INTO todos (user_id, title, description, category_id, due_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, title, description || null, categoryId || null, dueDate || null]
    );
    return result.rows[0];
  },

  async update(id, { title, description, categoryId, dueDate }) {
    const result = await query(
      `UPDATE todos
       SET title = $1, description = $2, category_id = $3, due_date = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [title, description || null, categoryId || null, dueDate || null, id]
    );
    return result.rows[0] || null;
  },

  async updateStatus(id, status) {
    const completedAt = status === 'COMPLETED' ? new Date() : null;
    const result = await query(
      `UPDATE todos
       SET status = $1,
           completed_at = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, completedAt, id]
    );
    return result.rows[0] || null;
  },

  async deleteById(id) {
    await query('DELETE FROM todos WHERE id = $1', [id]);
  },
};

module.exports = todoRepository;
