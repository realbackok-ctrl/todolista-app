'use strict';

const express = require('express');
const { authenticate } = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');
const categoryController = require('../controllers/categoryController');

const categoryRouter = express.Router();

categoryRouter.get('/', authenticate, categoryController.getCategories);
categoryRouter.post('/', authenticate, validate.createCategory, categoryController.createCategory);
categoryRouter.put('/:id', authenticate, validate.updateCategory, categoryController.updateCategory);
categoryRouter.delete('/:id', authenticate, categoryController.deleteCategory);

module.exports = categoryRouter;
