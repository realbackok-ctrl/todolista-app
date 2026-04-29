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
    .send({ email: 'todo_user1@example.com', password: 'password123' });

  await request(app)
    .post('/api/auth/register')
    .send({ email: 'todo_user2@example.com', password: 'password123' });

  const res1 = await request(app)
    .post('/api/auth/login')
    .send({ email: 'todo_user1@example.com', password: 'password123' });
  token1 = res1.body.token;

  const res2 = await request(app)
    .post('/api/auth/login')
    .send({ email: 'todo_user2@example.com', password: 'password123' });
  token2 = res2.body.token;
});

beforeEach(async () => {
  await pool.query('TRUNCATE todos, categories RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await pool.query('TRUNCATE todos, categories, users RESTART IDENTITY CASCADE');
  await pool.end();
});

describe('GET /api/todos', () => {
  test('인증 없으면 401', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(401);
  });

  test('빈 목록 200 { todos: [] }', async () => {
    const res = await request(app)
      .get('/api/todos')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.todos).toEqual([]);
  });
});

describe('POST /api/todos', () => {
  test('title 없으면 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ description: '설명만 있음' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('title 공백만 있으면 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('성공 201 { todo: { id, userId, title, status: PENDING, ... } }', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: '테스트 할일' });

    expect(res.status).toBe(201);
    expect(res.body.todo).toBeDefined();
    expect(res.body.todo.id).toBeDefined();
    expect(res.body.todo.userId).toBeDefined();
    expect(res.body.todo.title).toBe('테스트 할일');
    expect(res.body.todo.status).toBe('PENDING');
    expect(res.body.todo.completedAt).toBeNull();
  });
});

describe('GET /api/todos/:id', () => {
  let todoId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: '조회용 할일' });
    todoId = res.body.todo.id;
  });

  test('성공 200 { todo }', async () => {
    const res = await request(app)
      .get(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.todo.id).toBe(todoId);
  });

  test('존재하지 않는 id 404 NOT_FOUND', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .get(`/api/todos/${fakeId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  test('타인 todo 403 FORBIDDEN', async () => {
    const res = await request(app)
      .get(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

describe('PUT /api/todos/:id', () => {
  let todoId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: '수정 전 할일' });
    todoId = res.body.todo.id;
  });

  test('성공 200 { todo }', async () => {
    const res = await request(app)
      .put(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: '수정 후 할일' });

    expect(res.status).toBe(200);
    expect(res.body.todo.title).toBe('수정 후 할일');
  });
});

describe('PATCH /api/todos/:id/status', () => {
  let todoId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: '상태변경 할일' });
    todoId = res.body.todo.id;
  });

  test('COMPLETED 전환 시 completedAt 설정 200', async () => {
    const res = await request(app)
      .patch(`/api/todos/${todoId}/status`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(200);
    expect(res.body.todo.status).toBe('COMPLETED');
    expect(res.body.todo.completedAt).not.toBeNull();
  });

  test('PENDING 복구 시 completedAt null 200', async () => {
    await request(app)
      .patch(`/api/todos/${todoId}/status`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ status: 'COMPLETED' });

    const res = await request(app)
      .patch(`/api/todos/${todoId}/status`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ status: 'PENDING' });

    expect(res.status).toBe(200);
    expect(res.body.todo.status).toBe('PENDING');
    expect(res.body.todo.completedAt).toBeNull();
  });

  test('잘못된 status 값 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .patch(`/api/todos/${todoId}/status`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ status: 'INVALID' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('DELETE /api/todos/:id', () => {
  let todoId;
  let todo2Id;

  beforeEach(async () => {
    const res1 = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: '삭제할 할일' });
    todoId = res1.body.todo.id;

    const res2 = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token2}`)
      .send({ title: 'user2 할일' });
    todo2Id = res2.body.todo.id;
  });

  test('성공 200 { message }', async () => {
    const res = await request(app)
      .delete(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('할일이 성공적으로 삭제되었습니다.');
  });

  test('타인 todo 삭제 403 FORBIDDEN', async () => {
    const res = await request(app)
      .delete(`/api/todos/${todo2Id}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

describe('GET /api/todos 필터링', () => {
  beforeEach(async () => {
    const pending = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: 'PENDING 할일' });

    const completed = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: 'COMPLETED 할일' });

    await request(app)
      .patch(`/api/todos/${completed.body.todo.id}/status`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ status: 'COMPLETED' });
  });

  test('?status=PENDING 필터링', async () => {
    const res = await request(app)
      .get('/api/todos?status=PENDING')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.todos.length).toBe(1);
    expect(res.body.todos[0].status).toBe('PENDING');
  });

  test('?categoryId=uuid 카테고리 필터링', async () => {
    const catRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token1}`)
      .send({ name: '테스트 카테고리' });
    const categoryId = catRes.body.category.id;

    await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: '카테고리 있는 할일', categoryId });

    const res = await request(app)
      .get(`/api/todos?categoryId=${categoryId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.todos.length).toBe(1);
    expect(res.body.todos[0].categoryId).toBe(categoryId);
  });
});
