'use strict';

const AppError = require('../utils/AppError');

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const validate = {
  register(req, res, next) {
    const { email, password } = req.body;

    if (!email || !isValidEmail(email)) {
      return next(new AppError('유효한 이메일 형식이 아닙니다.', 400, 'VALIDATION_ERROR'));
    }

    if (!password || password.length < 8) {
      return next(new AppError('비밀번호는 8자 이상이어야 합니다.', 400, 'VALIDATION_ERROR'));
    }

    next();
  },

  login(req, res, next) {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('이메일과 비밀번호를 입력해주세요.', 400, 'VALIDATION_ERROR'));
    }

    next();
  },

  changePassword(req, res, next) {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('현재 비밀번호와 새 비밀번호를 입력해주세요.', 400, 'VALIDATION_ERROR'));
    }

    if (newPassword.length < 8) {
      return next(new AppError('새 비밀번호는 8자 이상이어야 합니다.', 400, 'VALIDATION_ERROR'));
    }

    next();
  },

  createTodo(req, res, next) {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return next(new AppError('할일 제목은 필수 항목입니다.', 400, 'VALIDATION_ERROR'));
    }
    next();
  },

  updateTodo(req, res, next) {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return next(new AppError('할일 제목은 필수 항목입니다.', 400, 'VALIDATION_ERROR'));
    }
    next();
  },

  updateTodoStatus(req, res, next) {
    const { status } = req.body;
    if (!status || !['PENDING', 'COMPLETED'].includes(status)) {
      return next(new AppError('status는 PENDING 또는 COMPLETED 중 하나여야 합니다.', 400, 'VALIDATION_ERROR'));
    }
    next();
  },

  createCategory(req, res, next) {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return next(new AppError('카테고리 이름은 필수 항목입니다.', 400, 'VALIDATION_ERROR'));
    }
    next();
  },

  updateCategory(req, res, next) {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return next(new AppError('카테고리 이름은 필수 항목입니다.', 400, 'VALIDATION_ERROR'));
    }
    next();
  },
};

module.exports = validate;
