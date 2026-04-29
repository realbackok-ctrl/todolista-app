'use strict';

const express = require('express');
const { authenticate } = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');
const todoController = require('../controllers/todoController');

const todoRouter = express.Router();

todoRouter.get('/', authenticate, todoController.getTodos);
todoRouter.post('/', authenticate, validate.createTodo, todoController.createTodo);
todoRouter.get('/:id', authenticate, todoController.getTodoById);
todoRouter.put('/:id', authenticate, validate.updateTodo, todoController.updateTodo);
todoRouter.patch('/:id/status', authenticate, validate.updateTodoStatus, todoController.updateTodoStatus);
todoRouter.delete('/:id', authenticate, todoController.deleteTodo);

module.exports = todoRouter;
