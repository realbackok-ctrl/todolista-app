'use strict';

const http = require('http');
const BASE = 'http://localhost:3000';
let pass = 0, fail = 0;

function req(method, path, data, token) {
  return new Promise((resolve) => {
    const body = data ? JSON.stringify(data) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    if (body) headers['Content-Length'] = Buffer.byteLength(body);
    const url = new URL(BASE + path);
    const options = { hostname: url.hostname, port: url.port || 3000, path: url.pathname + url.search, method, headers };
    const r = http.request(options, (res) => {
      let b = '';
      res.on('data', d => b += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(b) }); }
        catch { resolve({ status: res.statusCode, body: b }); }
      });
    });
    r.on('error', (e) => resolve({ status: 0, body: e.message }));
    if (body) r.write(body);
    r.end();
  });
}

function check(label, actual, expected) {
  const ok = actual === expected;
  console.log((ok ? '  PASS' : '  FAIL'), label, ok ? '' : `| 기대:${expected} 실제:${actual}`);
  ok ? pass++ : fail++;
  return ok;
}

async function run() {
  console.log('\n=== 1. 인증 (Auth) ===');

  let r = await req('POST', '/api/auth/register', { email: 'e2e_user1@test.com', password: 'password123' });
  check('회원가입 성공 201', r.status, 201);
  check('응답에 userId 포함', !!r.body.user?.id, true);

  r = await req('POST', '/api/auth/register', { email: 'e2e_user1@test.com', password: 'password123' });
  check('중복 이메일 409', r.status, 409);

  r = await req('POST', '/api/auth/register', { email: 'invalid-email', password: 'password123' });
  check('유효하지 않은 이메일 400', r.status, 400);

  r = await req('POST', '/api/auth/register', { email: 'e2e_user2@test.com', password: 'password123' });
  check('user2 회원가입 201', r.status, 201);

  r = await req('POST', '/api/auth/login', { email: 'e2e_user1@test.com', password: 'password123' });
  check('로그인 성공 200', r.status, 200);
  check('응답에 token 포함', !!r.body.token, true);
  const token1 = r.body.token;

  r = await req('POST', '/api/auth/login', { email: 'e2e_user2@test.com', password: 'password123' });
  check('user2 로그인 200', r.status, 200);
  const token2 = r.body.token;

  r = await req('POST', '/api/auth/login', { email: 'e2e_user1@test.com', password: 'wrongpass' });
  check('잘못된 비밀번호 401', r.status, 401);

  r = await req('POST', '/api/auth/logout', null, token1);
  check('로그아웃 성공 200', r.status, 200);

  r = await req('POST', '/api/auth/logout', null, null);
  check('토큰 없이 로그아웃 401', r.status, 401);

  r = await req('PATCH', '/api/auth/password', { currentPassword: 'password123', newPassword: 'newpass456' }, token1);
  check('비밀번호 변경 200', r.status, 200);

  r = await req('POST', '/api/auth/login', { email: 'e2e_user1@test.com', password: 'newpass456' });
  check('변경된 비밀번호로 로그인 200', r.status, 200);
  const token1New = r.body.token;

  console.log('\n=== 2. 카테고리 (Categories) ===');

  r = await req('GET', '/api/categories', null, token1New);
  check('빈 카테고리 목록 200', r.status, 200);
  check('categories 배열 반환', Array.isArray(r.body.categories), true);

  r = await req('POST', '/api/categories', { name: '업무' }, token1New);
  check('카테고리 생성 201', r.status, 201);
  check('카테고리명 일치', r.body.category?.name, '업무');
  const cat1Id = r.body.category?.id;

  r = await req('POST', '/api/categories', { name: '개인' }, token1New);
  check('카테고리2 생성 201', r.status, 201);
  const cat2Id = r.body.category?.id;

  r = await req('POST', '/api/categories', { name: '업무' }, token1New);
  check('중복 카테고리명 409', r.status, 409);

  r = await req('POST', '/api/categories', {}, token1New);
  check('name 없이 생성 400', r.status, 400);

  r = await req('PUT', '/api/categories/' + cat1Id, { name: '업무(수정)' }, token1New);
  check('카테고리 수정 200', r.status, 200);
  check('수정된 이름 일치', r.body.category?.name, '업무(수정)');

  r = await req('PUT', '/api/categories/' + cat1Id, { name: '업무(수정)' }, token1New);
  check('자기 이름으로 수정 허용 200', r.status, 200);

  r = await req('PUT', '/api/categories/' + cat1Id, { name: '개인' }, token1New);
  check('다른 카테고리 이름 중복 409', r.status, 409);

  r = await req('PUT', '/api/categories/' + cat1Id, { name: '타인시도' }, token2);
  check('타인 카테고리 수정 403', r.status, 403);

  console.log('\n=== 3. 할일 (Todos) ===');

  r = await req('GET', '/api/todos', null, token1New);
  check('빈 할일 목록 200', r.status, 200);
  check('todos 배열 반환', Array.isArray(r.body.todos), true);

  r = await req('POST', '/api/todos', { title: '첫 번째 할일' }, token1New);
  check('할일 생성 201', r.status, 201);
  check('status PENDING', r.body.todo?.status, 'PENDING');
  check('completedAt null', r.body.todo?.completedAt === null, true);
  const todo1Id = r.body.todo?.id;

  r = await req('POST', '/api/todos', { title: '카테고리 할일', categoryId: cat1Id }, token1New);
  check('카테고리 포함 할일 생성 201', r.status, 201);
  check('categoryId 일치', r.body.todo?.categoryId, cat1Id);
  const todo2Id = r.body.todo?.id;

  r = await req('POST', '/api/todos', {}, token1New);
  check('title 없이 생성 400', r.status, 400);

  r = await req('POST', '/api/todos', { title: '   ' }, token1New);
  check('공백 title 400', r.status, 400);

  r = await req('GET', '/api/todos/' + todo1Id, null, token1New);
  check('할일 단건 조회 200', r.status, 200);
  check('id 일치', r.body.todo?.id, todo1Id);

  r = await req('GET', '/api/todos/00000000-0000-0000-0000-000000000000', null, token1New);
  check('없는 할일 404', r.status, 404);

  r = await req('GET', '/api/todos/' + todo1Id, null, token2);
  check('타인 할일 조회 403', r.status, 403);

  r = await req('PUT', '/api/todos/' + todo1Id, { title: '수정된 할일' }, token1New);
  check('할일 수정 200', r.status, 200);
  check('수정된 title 일치', r.body.todo?.title, '수정된 할일');

  r = await req('PATCH', '/api/todos/' + todo1Id + '/status', { status: 'COMPLETED' }, token1New);
  check('COMPLETED 전환 200', r.status, 200);
  check('completedAt 설정됨', !!r.body.todo?.completedAt, true);

  r = await req('PATCH', '/api/todos/' + todo1Id + '/status', { status: 'PENDING' }, token1New);
  check('PENDING 복구 200', r.status, 200);
  check('completedAt null 복구', r.body.todo?.completedAt === null, true);

  r = await req('PATCH', '/api/todos/' + todo1Id + '/status', { status: 'INVALID' }, token1New);
  check('잘못된 status 400', r.status, 400);

  await req('PATCH', '/api/todos/' + todo1Id + '/status', { status: 'COMPLETED' }, token1New);
  r = await req('GET', '/api/todos?status=PENDING', null, token1New);
  check('status=PENDING 필터링', r.body.todos?.every(t => t.status === 'PENDING'), true);

  r = await req('GET', '/api/todos?status=COMPLETED', null, token1New);
  check('status=COMPLETED 필터링', r.body.todos?.every(t => t.status === 'COMPLETED'), true);

  r = await req('GET', '/api/todos?categoryId=' + cat1Id, null, token1New);
  check('categoryId 필터링 결과 1건', r.body.todos?.length === 1, true);
  check('categoryId 일치', r.body.todos?.[0]?.categoryId, cat1Id);

  console.log('\n=== 4. 카테고리 삭제 → 연결 할일 categoryId null ===');

  r = await req('DELETE', '/api/categories/' + cat1Id, null, token1New);
  check('카테고리 삭제 200', r.status, 200);

  r = await req('GET', '/api/todos/' + todo2Id, null, token1New);
  check('삭제 후 todo.categoryId null (BR-CAT-02)', r.body.todo?.categoryId === null, true);

  r = await req('DELETE', '/api/categories/' + cat2Id, null, token2);
  check('타인 카테고리 삭제 403', r.status, 403);

  console.log('\n=== 5. 할일 삭제 ===');

  r = await req('DELETE', '/api/todos/' + todo1Id, null, token2);
  check('타인 할일 삭제 403', r.status, 403);

  r = await req('DELETE', '/api/todos/' + todo1Id, null, token1New);
  check('할일 삭제 200', r.status, 200);

  r = await req('GET', '/api/todos/' + todo1Id, null, token1New);
  check('삭제 후 조회 404', r.status, 404);

  console.log('\n=== 6. 회원 탈퇴 ===');

  r = await req('DELETE', '/api/auth/account', null, token1New);
  check('회원 탈퇴 200', r.status, 200);

  r = await req('POST', '/api/auth/login', { email: 'e2e_user1@test.com', password: 'newpass456' });
  check('탈퇴 후 로그인 불가 401', r.status, 401);

  console.log('\n================================');
  console.log(`결과: PASS ${pass} / FAIL ${fail} / 전체 ${pass + fail}`);
  if (fail === 0) console.log('모든 테스트 통과');
  else console.log('일부 테스트 실패 - 위 FAIL 항목 확인 필요');
  console.log('================================\n');
}

run().catch(console.error);
