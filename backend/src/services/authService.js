'use strict';

const userRepository = require('../repositories/userRepository');
const hashPassword = require('../utils/hashPassword');
const jwtUtils = require('../utils/jwtUtils');
const AppError = require('../utils/AppError');

const authService = {
  async register({ email, password }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError('이미 사용 중인 이메일입니다.', 409, 'DUPLICATE_EMAIL');
    }

    const hashedPassword = await hashPassword.hash(password);
    const row = await userRepository.createUser({ email, hashedPassword });

    return {
      id: row.id,
      email: row.email,
      createdAt: row.created_at,
    };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('이메일 또는 비밀번호가 올바르지 않습니다.', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await hashPassword.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('이메일 또는 비밀번호가 올바르지 않습니다.', 401, 'INVALID_CREDENTIALS');
    }

    const token = jwtUtils.sign({ sub: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  },

  async deleteAccount(userId) {
    await userRepository.deleteUser(userId);
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('사용자를 찾을 수 없습니다.', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await hashPassword.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('현재 비밀번호가 올바르지 않습니다.', 401, 'INVALID_CREDENTIALS');
    }

    const isSame = await hashPassword.compare(newPassword, user.password);
    if (isSame) {
      throw new AppError('새 비밀번호는 현재 비밀번호와 달라야 합니다.', 400, 'VALIDATION_ERROR');
    }

    const hashed = await hashPassword.hash(newPassword);
    await userRepository.updatePassword(userId, hashed);
  },
};

module.exports = authService;
