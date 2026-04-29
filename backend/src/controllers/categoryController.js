'use strict';

const categoryService = require('../services/categoryService');

const categoryController = {
  async getCategories(req, res, next) {
    try {
      const categories = await categoryService.getCategories(req.user.id);
      res.status(200).json({ categories });
    } catch (err) {
      next(err);
    }
  },

  async createCategory(req, res, next) {
    try {
      const { name } = req.body;
      const category = await categoryService.createCategory(req.user.id, { name });
      res.status(201).json({ category });
    } catch (err) {
      next(err);
    }
  },

  async updateCategory(req, res, next) {
    try {
      const { name } = req.body;
      const category = await categoryService.updateCategory(req.user.id, req.params.id, { name });
      res.status(200).json({ category });
    } catch (err) {
      next(err);
    }
  },

  async deleteCategory(req, res, next) {
    try {
      await categoryService.deleteCategoryById(req.user.id, req.params.id);
      res.status(200).json({ message: '카테고리가 성공적으로 삭제되었습니다.' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = categoryController;
