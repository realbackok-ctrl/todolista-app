'use strict';

const todoService = require('../services/todoService');

const todoController = {
  async getTodos(req, res, next) {
    try {
      const { status, categoryId } = req.query;
      const todos = await todoService.getTodos(req.user.id, { status, categoryId });
      res.status(200).json({ todos });
    } catch (err) {
      next(err);
    }
  },

  async createTodo(req, res, next) {
    try {
      const { title, description, categoryId, dueDate } = req.body;
      const todo = await todoService.createTodo(req.user.id, { title, description, categoryId, dueDate });
      res.status(201).json({ todo });
    } catch (err) {
      next(err);
    }
  },

  async getTodoById(req, res, next) {
    try {
      const todo = await todoService.getTodoById(req.user.id, req.params.id);
      res.status(200).json({ todo });
    } catch (err) {
      next(err);
    }
  },

  async updateTodo(req, res, next) {
    try {
      const { title, description, categoryId, dueDate } = req.body;
      const todo = await todoService.updateTodo(req.user.id, req.params.id, { title, description, categoryId, dueDate });
      res.status(200).json({ todo });
    } catch (err) {
      next(err);
    }
  },

  async updateTodoStatus(req, res, next) {
    try {
      const { status } = req.body;
      const todo = await todoService.updateTodoStatus(req.user.id, req.params.id, status);
      res.status(200).json({ todo });
    } catch (err) {
      next(err);
    }
  },

  async deleteTodo(req, res, next) {
    try {
      await todoService.deleteTodo(req.user.id, req.params.id);
      res.status(200).json({ message: '할일이 성공적으로 삭제되었습니다.' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = todoController;
