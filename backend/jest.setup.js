'use strict';

const path = require('path');
const dotenv = require('dotenv');

// 루트의 .env.test 파일 로드
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// JWT 테스트용 기본값 설정
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key-for-jest-minimum-32chars';
}

if (!process.env.JWT_EXPIRES_IN) {
  process.env.JWT_EXPIRES_IN = '1h';
}

if (!process.env.BCRYPT_SALT_ROUNDS) {
  process.env.BCRYPT_SALT_ROUNDS = '1';
}
