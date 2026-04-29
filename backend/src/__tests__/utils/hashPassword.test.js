'use strict';

// BCRYPT_SALT_ROUNDS=1로 빠른 테스트 실행 (jest.setup.js에서 설정됨)
const hashPassword = require('../../utils/hashPassword');

describe('hashPassword', () => {
  describe('hash', () => {
    it('평문 비밀번호를 해시화하면 원본과 다른 문자열이 반환된다', async () => {
      const plain = 'MySecurePassword123!';

      const hashed = await hashPassword.hash(plain);

      expect(hashed).not.toBe(plain);
      expect(typeof hashed).toBe('string');
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('같은 비밀번호를 두 번 해시화해도 결과가 다르다 (salt 적용)', async () => {
      const plain = 'MySecurePassword123!';

      const hash1 = await hashPassword.hash(plain);
      const hash2 = await hashPassword.hash(plain);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('올바른 비밀번호 비교 시 true를 반환한다', async () => {
      const plain = 'MySecurePassword123!';
      const hashed = await hashPassword.hash(plain);

      const result = await hashPassword.compare(plain, hashed);

      expect(result).toBe(true);
    });

    it('틀린 비밀번호 비교 시 false를 반환한다', async () => {
      const plain = 'MySecurePassword123!';
      const wrong = 'WrongPassword456!';
      const hashed = await hashPassword.hash(plain);

      const result = await hashPassword.compare(wrong, hashed);

      expect(result).toBe(false);
    });

    it('빈 문자열 비밀번호 비교 시 false를 반환한다', async () => {
      const plain = 'MySecurePassword123!';
      const hashed = await hashPassword.hash(plain);

      const result = await hashPassword.compare('', hashed);

      expect(result).toBe(false);
    });
  });
});
