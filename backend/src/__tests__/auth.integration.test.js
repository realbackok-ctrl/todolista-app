'use strict';

const request = require('supertest');
const app = require('../app');
const { pool } = require('../db/pool');

beforeEach(async () => {
  await pool.query('TRUNCATE todos, categories, users CASCADE');
});

afterAll(async () => {
  await pool.end();
});

describe('POST /api/auth/register', () => {
  test('성공 - 201, { user: { id, email, createdAt } }', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.id).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.createdAt).toBeDefined();
  });

  test('중복 이메일 - 409 DUPLICATE_EMAIL', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@example.com', password: 'password123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@example.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
  });

  test('이메일 형식 오류 - 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('비밀번호 7자 - 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: '1234567' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login@example.com', password: 'password123' });
  });

  test('성공 - 200, { token, user }', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.id).toBeDefined();
    expect(res.body.user.email).toBe('login@example.com');
  });

  test('존재하지 않는 이메일 - 401 INVALID_CREDENTIALS', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'notfound@example.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  test('비밀번호 틀림 - 401 INVALID_CREDENTIALS', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('POST /api/auth/logout', () => {
  test('인증 없음 - 401 UNAUTHORIZED', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  test('인증 있음 - 200', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'logout@example.com', password: 'password123' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'logout@example.com', password: 'password123' });

    const token = loginRes.body.token;

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('로그아웃되었습니다.');
  });
});

describe('DELETE /api/auth/account', () => {
  test('인증 없음 - 401', async () => {
    const res = await request(app).delete('/api/auth/account');

    expect(res.status).toBe(401);
  });

  test('성공 - 200', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'delete@example.com', password: 'password123' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'delete@example.com', password: 'password123' });

    const token = loginRes.body.token;

    const res = await request(app)
      .delete('/api/auth/account')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('계정이 성공적으로 삭제되었습니다.');
  });
});

describe('PATCH /api/auth/password', () => {
  let token;

  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'changepw@example.com', password: 'password123' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'changepw@example.com', password: 'password123' });

    token = loginRes.body.token;
  });

  test('현재 비밀번호 틀림 - 401 INVALID_CREDENTIALS', async () => {
    const res = await request(app)
      .patch('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'wrongpassword', newPassword: 'newpassword123' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  test('새 비밀번호 8자 미만 - 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .patch('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'password123', newPassword: '1234567' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('현재와 동일한 새 비밀번호 - 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .patch('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'password123', newPassword: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('성공 - 200', async () => {
    const res = await request(app)
      .patch('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'password123', newPassword: 'newpassword123' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('비밀번호가 성공적으로 변경되었습니다.');
  });
});
