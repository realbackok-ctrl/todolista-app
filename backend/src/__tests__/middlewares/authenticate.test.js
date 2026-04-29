'use strict';

const { authenticate } = require('../../middlewares/authenticate');
const jwtUtils = require('../../utils/jwtUtils');
const AppError = require('../../utils/AppError');

/**
 * Express req/res/next 목 생성 헬퍼
 */
function createMocks(authHeader) {
  const req = {
    headers: authHeader !== undefined ? { authorization: authHeader } : {},
  };
  const res = {};
  const next = jest.fn();
  return { req, res, next };
}

describe('authenticate 미들웨어', () => {
  describe('Authorization 헤더 없을 때', () => {
    it('헤더 자체가 없으면 next에 401 UNAUTHORIZED AppError를 전달한다', async () => {
      const { req, res, next } = createMocks(undefined);

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(401);
      expect(err.code).toBe('UNAUTHORIZED');
    });

    it('Authorization 헤더가 빈 문자열이면 401을 반환한다', async () => {
      const { req, res, next } = createMocks('');

      await authenticate(req, res, next);

      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(401);
    });
  });

  describe('Bearer 스킴 없이 토큰만 보낼 때', () => {
    it('Bearer 접두사 없이 토큰만 보내면 401을 반환한다', async () => {
      const payload = { sub: 'user-123', email: 'test@example.com' };
      const token = jwtUtils.sign(payload);
      const { req, res, next } = createMocks(token); // "Bearer " 없이 토큰만

      await authenticate(req, res, next);

      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(401);
      expect(err.code).toBe('UNAUTHORIZED');
    });

    it('"Token {token}" 형식으로 보내면 401을 반환한다', async () => {
      const payload = { sub: 'user-123', email: 'test@example.com' };
      const token = jwtUtils.sign(payload);
      const { req, res, next } = createMocks(`Token ${token}`);

      await authenticate(req, res, next);

      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(401);
    });
  });

  describe('잘못된 형식의 토큰', () => {
    it('위변조된 토큰이면 401 UNAUTHORIZED를 반환한다', async () => {
      const { req, res, next } = createMocks('Bearer invalid.token.here');

      await authenticate(req, res, next);

      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(401);
      expect(err.code).toBe('UNAUTHORIZED');
    });

    it('"Bearer " 이후 토큰이 빈 문자열이면 401을 반환한다', async () => {
      const { req, res, next } = createMocks('Bearer ');

      await authenticate(req, res, next);

      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(401);
    });
  });

  describe('만료된 토큰', () => {
    it('만료된 토큰이면 401 UNAUTHORIZED를 반환한다', async () => {
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { sub: 'user-123', email: 'test@example.com' },
        process.env.JWT_SECRET,
        { algorithm: 'HS512', expiresIn: 0 }
      );
      const { req, res, next } = createMocks(`Bearer ${expiredToken}`);

      await authenticate(req, res, next);

      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(401);
      expect(err.code).toBe('UNAUTHORIZED');
    });
  });

  describe('유효한 토큰', () => {
    it('유효한 토큰이면 req.user에 id와 email이 설정된다', async () => {
      const payload = { sub: 'user-abc', email: 'hello@example.com' };
      const token = jwtUtils.sign(payload);
      const { req, res, next } = createMocks(`Bearer ${token}`);

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(); // 에러 없이 next() 호출
      expect(next.mock.calls[0]).toHaveLength(0); // 인자 없음
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe('user-abc');
      expect(req.user.email).toBe('hello@example.com');
    });

    it('유효한 토큰이면 next()를 에러 없이 호출한다', async () => {
      const payload = { sub: 'user-xyz', email: 'user@test.com' };
      const token = jwtUtils.sign(payload);
      const { req, res, next } = createMocks(`Bearer ${token}`);

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeUndefined();
    });
  });
});
