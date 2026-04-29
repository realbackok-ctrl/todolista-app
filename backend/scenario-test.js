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
  const ts = Date.now();
  console.log(`\n=== Scenario Test Started (TS: ${ts}) ===`);

  console.log('\n=== [SC-01] 신규 가입 및 첫 로그인 ===');
  const userA = { email: `chulsoo_${ts}@example.com`, password: 'password123' };
  
  let r = await req('POST', '/api/auth/register', userA);
  check('김철수 회원가입 201', r.status, 201);
  
  r = await req('POST', '/api/auth/login', userA);
  check('김철수 첫 로그인 200', r.status, 200);
  let tokenA = r.body.token;
  check('인증 토큰 발급 확인', !!tokenA, true);

  console.log('\n=== [SC-02] 카테고리 생성 및 관리 ===');
  r = await req('POST', '/api/categories', { name: '업무' }, tokenA);
  check('업무 카테고리 생성 201', r.status, 201);
  const catWorkId = r.body.category.id;

  r = await req('POST', '/api/categories', { name: '개인' }, tokenA);
  check('개인 카테고리 생성 201', r.status, 201);
  
  r = await req('POST', '/api/categories', { name: '공부' }, tokenA);
  check('공부 카테고리 생성 201', r.status, 201);
  const catStudyId = r.body.category.id;

  r = await req('PUT', '/api/categories/' + catStudyId, { name: '자기계발' }, tokenA);
  check('카테고리명 수정 (공부 -> 자기계발) 200', r.status, 200);

  r = await req('DELETE', '/api/categories/' + catStudyId, null, tokenA);
  check('자기계발 카테고리 삭제 200', r.status, 200);

  r = await req('GET', '/api/categories', null, tokenA);
  check('남은 카테고리 수 확인 (2개)', r.body.categories.length, 2);

  console.log('\n=== [SC-03] 할일 생성 및 목록 조회 ===');
  const userB = { email: `soyoung_${ts}@example.com`, password: 'password123' };
  await req('POST', '/api/auth/register', userB);
  r = await req('POST', '/api/auth/login', userB);
  let tokenB = r.body.token;

  // 카테고리 생성 (사전 조건)
  const c1 = await req('POST', '/api/categories', { name: '가사' }, tokenB);
  const c2 = await req('POST', '/api/categories', { name: '육아' }, tokenB);
  const c3 = await req('POST', '/api/categories', { name: '개인' }, tokenB);
  const catGasaId = c1.body.category.id;

  r = await req('POST', '/api/todos', { 
    title: '마트 장보기', 
    categoryId: catGasaId, 
    dueDate: new Date(Date.now() + 3600000).toISOString() // 1시간 후
  }, tokenB);
  check('마트 장보기 생성 201', r.status, 201);
  const todoMartId = r.body.todo.id;

  r = await req('POST', '/api/todos', { title: '어린이집 하원 준비', categoryId: c2.body.category.id }, tokenB);
  check('어린이집 하원 준비 생성 201', r.status, 201);

  r = await req('POST', '/api/todos', { title: '병원 예약 확인' }, tokenB);
  check('병원 예약 확인(카테고리 미지정) 생성 201', r.status, 201);
  const todoHospitalId = r.body.todo.id;

  r = await req('GET', '/api/todos', null, tokenB);
  check('전체 할일 목록 조회 200', r.status, 200);
  check('목록 개수 확인 (3개)', r.body.todos.length, 3);

  r = await req('GET', '/api/todos?categoryId=' + catGasaId, null, tokenB);
  check('가사 카테고리 필터링 200', r.status, 200);
  check('필터링 결과 확인 (1건)', r.body.todos.length, 1);
  check('필터링 제목 확인', r.body.todos[0].title, '마트 장보기');

  console.log('\n=== [SC-04] 할일 상세 조회 및 수정 ===');
  // 김철수의 할일로 테스트
  r = await req('POST', '/api/todos', { title: '분기 보고서 작성', categoryId: catWorkId }, tokenA);
  const todoReportId = r.body.todo.id;

  r = await req('GET', '/api/todos/' + todoReportId, null, tokenA);
  check('할일 상세 조회 200', r.status, 200);
  check('상세 조회 제목 확인', r.body.todo.title, '분기 보고서 작성');

  r = await req('PUT', '/api/todos/' + todoReportId, { 
    title: '분기 보고서 작성', 
    description: '팀장 검토 포함 일정 여유 확보 필요',
    dueDate: new Date(Date.now() + 172800000).toISOString() // 2일 후
  }, tokenA);
  check('할일 수정 200', r.status, 200);
  check('수정된 설명 확인', r.body.todo.description, '팀장 검토 포함 일정 여유 확보 필요');

  console.log('\n=== [SC-05] 할일 완료 처리 및 복구 ===');
  r = await req('PATCH', '/api/todos/' + todoMartId + '/status', { status: 'COMPLETED' }, tokenB);
  check('마트 장보기 완료 처리 200', r.status, 200);
  check('완료 시각 기록 확인', !!r.body.todo.completedAt, true);

  r = await req('GET', '/api/todos?status=COMPLETED', null, tokenB);
  check('완료 필터링 조회 200', r.status, 200);
  check('완료 목록 확인 (1건)', r.body.todos.length, 1);

  r = await req('PATCH', '/api/todos/' + todoMartId + '/status', { status: 'PENDING' }, tokenB);
  check('마트 장보기 복구 200', r.status, 200);
  check('완료 시각 초기화 확인', r.body.todo.completedAt, null);

  console.log('\n=== [SC-06] Overdue 할일 식별 및 처리 ===');
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  r = await req('POST', '/api/todos', { title: '주간 회의 자료 준비', dueDate: yesterday }, tokenA);
  const todoOverdueId = r.body.todo.id;

  r = await req('GET', '/api/todos', null, tokenA);
  const todoOverdue = r.body.todos.find(t => t.id === todoOverdueId);
  const isOverdue = new Date(todoOverdue.dueDate) < new Date() && todoOverdue.status === 'PENDING';
  check('Overdue 로직 검증 (dueDate < Now && PENDING)', isOverdue, true);

  r = await req('PUT', '/api/todos/' + todoOverdueId, { 
    title: '주간 회의 자료 준비', 
    dueDate: new Date(Date.now() + 3600000).toISOString() 
  }, tokenA);
  check('종료일 수정으로 Overdue 해제 200', r.status, 200);
  console.log('  DEBUG: Updated dueDate from API:', r.body.todo.dueDate);
  const isNowPending = new Date(r.body.todo.dueDate) > new Date();
  check('Overdue 해제 확인', isNowPending, true);

  console.log('\n=== [SC-07] 할일 삭제 ===');
  r = await req('DELETE', '/api/todos/' + todoHospitalId, null, tokenB);
  check('할일 삭제 200', r.status, 200);

  r = await req('GET', '/api/todos/' + todoHospitalId, null, tokenB);
  check('삭제된 할일 조회 불가 404', r.status, 404);

  console.log('\n=== [SC-08] 로그아웃 및 재로그인 ===');
  r = await req('POST', '/api/auth/logout', null, tokenB);
  check('박소영 로그아웃 200', r.status, 200);

  r = await req('POST', '/api/auth/login', userB);
  check('박소영 재로그인 200', r.status, 200);
  tokenB = r.body.token;
  check('데이터 유지 확인 (남은 할일 2개)', (await req('GET', '/api/todos', null, tokenB)).body.todos.length, 2);

  console.log('\n=== [SC-09] 회원탈퇴 ===');
  r = await req('DELETE', '/api/auth/account', null, tokenA);
  check('김철수 회원탈퇴 200', r.status, 200);

  r = await req('POST', '/api/auth/login', userA);
  check('탈퇴 후 로그인 불가 401', r.status, 401);

  console.log('\n=== [SC-10] 비밀번호 변경 ===');
  const userC = { email: `test_c_${ts}@example.com`, password: 'oldpassword' };
  await req('POST', '/api/auth/register', userC);
  r = await req('POST', '/api/auth/login', userC);
  let tokenC = r.body.token;

  r = await req('PATCH', '/api/auth/password', { currentPassword: 'oldpassword', newPassword: 'newpassword123' }, tokenC);
  check('비밀번호 변경 200', r.status, 200);

  r = await req('GET', '/api/categories', null, tokenC);
  console.log('  INFO: 비밀번호 변경 후 기존 토큰 사용 결과 status =', r.status);
  check('기존 토큰 무효화 확인 (401)', r.status, 401);

  r = await req('POST', '/api/auth/login', { email: userC.email, password: 'newpassword123' });
  check('새 비밀번호로 로그인 200', r.status, 200);

  console.log('\n================================');
  console.log(`최종 결과: PASS ${pass} / FAIL ${fail} / 전체 ${pass + fail}`);
  if (fail === 0) console.log('모든 시나리오 테스트 통과');
  else console.log(`${fail}개의 테스트 실패. 상세 내용을 확인하세요.`);
  console.log('================================\n');
}

run().catch(console.error);
