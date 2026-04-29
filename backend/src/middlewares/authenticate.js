'use strict';

const jwtUtils = require('../utils/jwtUtils');
const AppError = require('../utils/AppError');

/**
 * JWT Bearer 토큰 인증 미들웨어
 * Authorization: Bearer {token} 헤더를 검증하고
 * req.user = { id, email } 를 설정한다.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('유효한 인증 토큰이 필요합니다.', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.slice(7); // 'Bearer ' 이후 토큰 추출

    if (!token) {
      throw new AppError('유효한 인증 토큰이 필요합니다.', 401, 'UNAUTHORIZED');
    }

    const payload = jwtUtils.verify(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
    };

    next();
  } catch (err) {
    if (err instanceof AppError) {
      return next(err);
    }
    // JWT 만료, 위변조 등 jsonwebtoken 에러 처리
    next(new AppError('유효한 인증 토큰이 필요합니다.', 401, 'UNAUTHORIZED'));
  }
}

module.exports = { authenticate };
