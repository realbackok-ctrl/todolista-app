'use strict';

const todoRepository = require('../repositories/todoRepository');
const AppError = require('../utils/AppError');

function mapTodo(row) {
  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    title: row.title,
    description: row.description,
    status: row.status,
    dueDate: row.due_date,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function assertOwnership(todoId, userId) {
  const todo = await todoRepository.findById(todoId);
  if (!todo) {
    throw new AppError('할일을 찾을 수 없습니다.', 404, 'NOT_FOUND');
  }
  if (todo.user_id !== userId) {
    throw new AppError('접근 권한이 없습니다.', 403, 'FORBIDDEN');
  }
  return todo;
}

const todoService = {
  async getTodos(userId, { status, categoryId } = {}) {
    const rows = await todoRepository.findAllByUserId(userId, { status, categoryId });
    return rows.map(mapTodo);
  },

  async getTodoById(userId, todoId) {
    const todo = await assertOwnership(todoId, userId);
    return mapTodo(todo);
  },

  async createTodo(userId, { title, description, categoryId, dueDate }) {
    const row = await todoRepository.create({ userId, title, description, categoryId, dueDate });
    return mapTodo(row);
  },

  async updateTodo(userId, todoId, { title, description, categoryId, dueDate }) {
    await assertOwnership(todoId, userId);
    const row = await todoRepository.update(todoId, { title, description, categoryId, dueDate });
    return mapTodo(row);
  },

  async updateTodoStatus(userId, todoId, status) {
    await assertOwnership(todoId, userId);
    const row = await todoRepository.updateStatus(todoId, status);
    return mapTodo(row);
  },

  async deleteTodo(userId, todoId) {
    await assertOwnership(todoId, userId);
    await todoRepository.deleteById(todoId);
  },
};

module.exports = todoService;
