'use strict';

const { pool, query } = require('../../db/pool');

describe('BE-04: DB 연결 통합 테스트', () => {
  afterAll(async () => {
    await pool.end();
  });

  test('DB 연결 확인 - SELECT NOW()', async () => {
    const result = await query('SELECT NOW()');
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].now).toBeInstanceOf(Date);
  });

  test('users 테이블 존재 확인', async () => {
    const result = await query('SELECT 1 FROM users LIMIT 0');
    expect(result).toBeDefined();
  });

  test('categories 테이블 존재 확인', async () => {
    const result = await query('SELECT 1 FROM categories LIMIT 0');
    expect(result).toBeDefined();
  });

  test('todos 테이블 존재 확인', async () => {
    const result = await query('SELECT 1 FROM todos LIMIT 0');
    expect(result).toBeDefined();
  });
});
