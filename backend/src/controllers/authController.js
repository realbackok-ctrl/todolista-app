'use strict';

const authService = require('../services/authService');

const authController = {
  async register(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await authService.register({ email, password });
      res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { token, user } = await authService.login({ email, password });
      res.status(200).json({ token, user });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      res.status(200).json({ message: '로그아웃되었습니다.' });
    } catch (err) {
      next(err);
    }
  },

  async deleteAccount(req, res, next) {
    try {
      await authService.deleteAccount(req.user.id);
      res.status(200).json({ message: '계정이 성공적으로 삭제되었습니다.' });
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user.id, { currentPassword, newPassword });
      res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
