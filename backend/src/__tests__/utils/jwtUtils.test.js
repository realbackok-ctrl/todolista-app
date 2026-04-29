'use strict';

const jwtUtils = require('../../utils/jwtUtils');

describe('jwtUtils', () => {
  describe('sign & verify', () => {
    it('sign으로 토큰을 생성하고 verify로 페이로드를 검증한다', () => {
      const payload = { sub: 'user-123', email: 'test@example.com' };

      const token = jwtUtils.sign(payload);

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT 형식: header.payload.signature

      const decoded = jwtUtils.verify(token);
      expect(decoded.sub).toBe('user-123');
      expect(decoded.email).toBe('test@example.com');
    });

    it('잘못된 토큰으로 verify 시 에러가 발생한다', () => {
      expect(() => {
        jwtUtils.verify('invalid.token.here');
      }).toThrow();
    });

    it('변조된 토큰으로 verify 시 에러가 발생한다', () => {
      const payload = { sub: 'user-123', email: 'test@example.com' };
      const token = jwtUtils.sign(payload);
      const tampered = token.slice(0, -5) + 'XXXXX'; // 서명 부분 변조

      expect(() => {
        jwtUtils.verify(tampered);
      }).toThrow();
    });

    it('만료된 토큰으로 verify 시 에러가 발생한다', () => {
      const jwt = require('jsonwebtoken');
      // expiresIn: 0으로 즉시 만료 토큰 생성
      const expiredToken = jwt.sign(
        { sub: 'user-123', email: 'test@example.com' },
        process.env.JWT_SECRET,
        { algorithm: 'HS512', expiresIn: 0 }
      );

      expect(() => {
        jwtUtils.verify(expiredToken);
      }).toThrow();
    });

    it('빈 문자열 토큰으로 verify 시 에러가 발생한다', () => {
      expect(() => {
        jwtUtils.verify('');
      }).toThrow();
    });
  });
});
