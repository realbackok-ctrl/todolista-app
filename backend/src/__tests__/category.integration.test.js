'use strict';

const request = require('supertest');
const app = require('../app');
const { pool } = require('../db/pool');

let token1;
let token2;

beforeAll(async () => {
  await pool.query('TRUNCATE todos, categories, users RESTART IDENTITY CASCADE');

  await request(app)
    .post('/api/auth/register')
    .send({ email: 'cat_user1@example.com', password: 'password123' });

  await request(app)
    .post('/api/auth/register')
    .send({ email: 'cat_user2@example.com', password: 'password123' });

  const res1 = await request(app)
    .post('/api/auth/login')
    .send({ email: 'cat_user1@example.com', password: 'password123' });
  token1 = res1.body.token;

  const res2 = await request(app)
    .post('/api/auth/login')
    .send({ email: 'cat_user2@example.com', password: 'password123' });
  token2 = res2.body.token;
});

beforeEach(async () => {
  await pool.query('TRUNCATE todos, categories RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await pool.query('TRUNCATE todos, categories, users RESTART IDENTITY CASCADE');
  await pool.end();
});

describe('GET /api/categories', () => {
  test('인증 없으면 401', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(401);
  });

  test('빈 목록 200 { categories: [] }', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.categories).toEqual([]);
  });
});

describe('POST /api/categories', () => {
  test('name 없으면 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token1}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('성공 201 { category: { id, userId, name, createdAt } }', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token1}`)
      .send({ name: '업무' });

    expect(res.status).toBe(201);
    expect(res.body.category).toBeDefined();
    expect(res.body.category.id).toBeDefined();
    expect(res.body.category.userId).toBeDefined();
    expect(res.body.category.name).toBe('업무');
    expect(res.body.category.createdAt).toBeDefined();
  });

  test('중복 이름 409 DUPLICATE_NAME', async () => {
    await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token1}`)
      .send({ name: '중복카테고리' });

    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token1}`)
      .send({ name: '중복카테고리' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_NAME');
  });
});

describe('PUT /api/categories/:id', () => {
  let categoryId;
  let cat2Id;

  beforeEach(async () => {
    const res1 = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token1}`)
      .send({ name: '수정 전 카테고리' });
    categoryId = res1.body.category.id;

    const res2 = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token1}`)
      .send({ name: '다른 카테고리' });
    cat2Id = res2.body.category.id;
  });

  test('성공 200 { category }', async () => {
    const res = await request(app)
      .put(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ name: '수정 후 카테고리' });

    expect(res.status).toBe(200);
    expect(res.body.category.name).toBe('수정 후 카테고리');
  });

  test('중복 이름 409 DUPLICATE_NAME', async () => {
    const res = await request(app)
      .put(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ name: '다른 카테고리' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_NAME');
  });

  test('자기 자신 이름으로 수정은 허용 200', async () => {
    const res = await request(app)
      .put(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ name: '수정 전 카테고리' });

    expect(res.status).toBe(200);
    expect(res.body.category.name).toBe('수정 전 카테고리');
  });

  test('타인 카테고리 403 FORBIDDEN', async () => {
    const res = await request(app)
      .put(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ name: '변경 시도' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('없는 카테고리 404 NOT_FOUND', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .put(`/api/categories/${fakeId}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ name: '변경 시도' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('DELETE /api/categories/:id', () => {
  let categoryId;
  let user2CategoryId;

  beforeEach(async () => {
    const res1 = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token1}`)
      .send({ name: '삭제할 카테고리' });
    categoryId = res1.body.category.id;

    const res2 = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token2}`)
      .send({ name: 'user2 카테고리' });
    user2CategoryId = res2.body.category.id;
  });

  test('성공 200 { message }', async () => {
    const res = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('카테고리가 성공적으로 삭제되었습니다.');
  });

  test('삭제 후 연결된 todo의 categoryId가 null (BR-CAT-02)', async () => {
    const todoRes = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: '카테고리 연결 할일', categoryId });
    const todoId = todoRes.body.todo.id;

    await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token1}`);

    const todoCheck = await request(app)
      .get(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(todoCheck.status).toBe(200);
    expect(todoCheck.body.todo.categoryId).toBeNull();
  });

  test('타인 카테고리 삭제 403 FORBIDDEN', async () => {
    const res = await request(app)
      .delete(`/api/categories/${user2CategoryId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
