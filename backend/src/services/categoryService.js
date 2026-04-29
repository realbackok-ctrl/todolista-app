'use strict';

const categoryRepository = require('../repositories/categoryRepository');
const AppError = require('../utils/AppError');

function mapCategory(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    createdAt: row.created_at,
  };
}

async function assertOwnership(categoryId, userId) {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new AppError('카테고리를 찾을 수 없습니다.', 404, 'NOT_FOUND');
  }
  if (category.user_id !== userId) {
    throw new AppError('접근 권한이 없습니다.', 403, 'FORBIDDEN');
  }
  return category;
}

const categoryService = {
  async getCategories(userId) {
    const rows = await categoryRepository.findAllByUserId(userId);
    return rows.map(mapCategory);
  },

  async createCategory(userId, { name }) {
    const existing = await categoryRepository.findByUserIdAndName(userId, name);
    if (existing) {
      throw new AppError('이미 사용 중인 카테고리 이름입니다.', 409, 'DUPLICATE_NAME');
    }
    const row = await categoryRepository.create({ userId, name });
    return mapCategory(row);
  },

  async updateCategory(userId, categoryId, { name }) {
    await assertOwnership(categoryId, userId);

    const existing = await categoryRepository.findByUserIdAndName(userId, name);
    if (existing && existing.id !== categoryId) {
      throw new AppError('이미 사용 중인 카테고리 이름입니다.', 409, 'DUPLICATE_NAME');
    }

    const row = await categoryRepository.update(categoryId, { name });
    return mapCategory(row);
  },

  async deleteCategoryById(userId, categoryId) {
    await assertOwnership(categoryId, userId);
    await categoryRepository.deleteById(categoryId);
  },
};

module.exports = categoryService;
