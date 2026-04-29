# TodoList 애플리케이션 실행계획

**버전:** 1.0
**작성일:** 2026-04-28
**참조 문서:** `docs/2-prd.md` v1.1, `docs/4-project-structure.md` v1.1, `docs/6-erd.md` v1.0

---

## 변경 이력

| 버전 | 변경일 | 작성자 | 변경 내용 |
|------|--------|--------|-----------|
| 1.0 | 2026-04-28 | Execution Planner | 최초 작성 (DB 5건, BE 8건, FE 14건, 총 27 Task) |
| 1.1 | 2026-04-28 | Executor | DB-01~DB-05 완료 (체크박스 체크 완료) |
| 1.2 | 2026-04-29 | Executor | BE-01 완료 (체크박스 체크 완료) |
| 1.3 | 2026-04-29 | Executor | BE-02~BE-03 완료 (체크박스 체크 완료) |
| 1.4 | 2026-04-29 | Executor | BE-04~BE-05 완료 (체크박스 체크 완료) |
| 1.5 | 2026-04-29 | Executor | BE-06~BE-07 완료 (체크박스 체크 완료) |
| 1.6 | 2026-04-29 | Executor | BE-08 완료 (체크박스 체크 완료) |
| 1.7 | 2026-04-29 | Executor | DB-04 완료 (체크박스 체크 완료) |

---

## 전체 Task 현황

| 영역 | Task 수 | 총 예상 소요 |
|------|---------|-------------|
| DB   | 5건     | 약 2시간 45분 |
| BE   | 8건     | 약 10시간 45분 |
| FE   | 14건    | 약 20시간 |
| **합계** | **27건** | **약 33시간 30분** |

---

## Phase 1 일정 배분

| 날짜 | DB | BE | FE |
|------|----|----|-----|
| **04-28** (Day 1) | DB-01 ~ DB-04 | BE-01 ~ BE-04 | FE-01 ~ FE-05 |
| **04-29** (Day 2) | DB-05 | BE-05 ~ BE-07 | FE-06 ~ FE-09, FE-11 |
| **04-30** (Day 3) | — | BE-08 | FE-10, FE-12 ~ FE-14 |

---

## 전체 의존성 그래프

```
DB-01
  └─ DB-02
       ├─ DB-03 ─── DB-05
       └─ DB-04 ─── DB-05

BE-01
  └─ BE-02
       ├─ BE-03 ─┬─ BE-05 ─┐
       └─ BE-04 ─┤─ BE-06 ─┼─ BE-08
                 └─ BE-07 ─┘

FE-01
  ├─ FE-02 ─┬─ FE-03
  │          ├─ FE-05 ─┬─ FE-06 ─── FE-13
  │          ├─ FE-07 ─┼─ FE-08 ─── FE-09 ─── FE-10
  │          └─ FE-11 ─┘
  └─ FE-04 ─────────────── FE-06, FE-08, FE-09, FE-12, FE-13
                                          └── FE-14 (모든 페이지 완료 후)
```

---

## 1. DB 영역 실행계획

### DB-01. 로컬 PostgreSQL 환경 설정

**설명:** PostgreSQL을 설치하고 `todolista_dev` 전용 DB 및 사용자 계정을 생성하여 개발 환경 기반을 마련한다.

**완료 조건:**
- [x] PostgreSQL 서비스 정상 기동, `psql --version`으로 버전 확인
- [x] `todolista_dev` 데이터베이스 및 전용 사용자 계정 생성
- [x] `.env`에 `DATABASE_URL` 설정 완료
- [x] pg 라이브러리로 연결 테스트 스크립트 실행 시 "Connected" 확인
- [x] `.env`가 `.gitignore`에 등록됨

**의존성:** 없음
**예상 소요:** 30분

---

### DB-02. schema.sql 실행 및 테이블 생성 검증

**설명:** `database/schema.sql`을 `todolista_dev`에 실행하고 테이블·ENUM·FK 제약조건이 의도대로 생성되었는지 검증한다.

**완료 조건:**
- [x] `psql -d todolista_dev -f database/schema.sql` 오류 없이 완료
- [x] `\dt`로 `users`, `categories`, `todos` 3개 테이블 존재 확인
- [x] `\dT`로 `todo_status` ENUM(`PENDING`, `COMPLETED`) 정의 확인
- [x] `categories.user_id` → CASCADE, `todos.category_id` → SET NULL FK 제약조건 확인
- [x] `schema.sql` 재실행 시 멱등성 보장 확인

**의존성:** DB-01 완료 후
**예상 소요:** 30분

---

### DB-03. 인덱스 및 제약조건 검증

**설명:** 5개 인덱스와 UNIQUE 제약조건이 실제로 생성되었는지 확인하고 EXPLAIN으로 인덱스 활용 여부를 검증한다.

**완료 조건:**
- [x] `\di`로 5개 인덱스(`idx_categories_user_id`, `idx_todos_user_id`, `idx_todos_category_id`, `idx_todos_status`, `idx_todos_due_date`) 존재 확인
- [x] `categories(user_id, name)` 복합 UNIQUE 위반 시 오류 발생 확인 (INSERT 테스트)
- [x] `users.email` UNIQUE 위반 시 오류 발생 확인 (INSERT 테스트)
- [x] `EXPLAIN SELECT * FROM todos WHERE user_id = $1` 실행 시 Index Scan 확인

**의존성:** DB-02 완료 후
**예상 소요:** 30분

---

### DB-04. 테스트용 DB 환경 분리

**설명:** 개발 DB와 독립된 `todolista_test` DB를 생성하고 `.env.test`를 구성하여 테스트 격리 환경을 구축한다.

**완료 조건:**
- [x] `todolista_test` DB 생성 및 `schema.sql` 동일 적용
- [x] `.env.test`에 `DATABASE_URL`이 `todolista_test`를 가리키도록 설정
- [x] `.env.test`가 `.gitignore`에 등록됨
- [x] `NODE_ENV=test` 실행 시 `.env.test`를 자동 로드하는 로직 구현 확인
- [x] 테스트 전후 `TRUNCATE ... CASCADE` 초기화 스크립트 준비 완료

**의존성:** DB-02 완료 후
**예상 소요:** 30분

---

### DB-05. 시드(Seed) 데이터 작성

**설명:** 개발 및 기능 검증용 초기 데이터를 `database/seed.sql`(또는 `seed.js`)로 작성하고 `npm run db:seed`로 일괄 삽입한다.

**완료 조건:**
- [x] 테스트 사용자 최소 2건(bcrypt 해시 비밀번호 포함) `users` 삽입
- [x] 각 사용자별 카테고리 최소 2건씩(총 4건 이상) `categories` 삽입
- [x] 다양한 `status`와 `due_date`를 포함한 `todos` 최소 10건 삽입 (Overdue 포함)
- [x] `npm run db:seed` 한 번으로 전체 삽입 가능하며 재실행 시 오류 없음 (멱등성)
- [x] 삽입 후 `SELECT COUNT(*)` 쿼리로 각 테이블 건수 확인

**의존성:** DB-03, DB-04 완료 후
**예상 소요:** 45분

---

## 2. BE 영역 실행계획

### BE-01. 프로젝트 초기화 및 디렉토리 구조 세팅

**설명:** Node.js 24 + Express 5 기반 백엔드 프로젝트의 패키지 구성, 환경변수 템플릿, 전체 디렉토리 골격을 세팅한다.

**완료 조건:**
- [x] `package.json`에 dependencies(`express`, `pg`, `bcrypt`, `jsonwebtoken`, `dotenv`) 및 devDependencies(`jest`, `supertest`, `nodemon`) 정의 완료
- [x] `backend/src/` 하위 `routes/`, `controllers/`, `services/`, `repositories/`, `middlewares/`, `db/`, `utils/` 폴더 및 빈 파일 생성 완료
- [x] `.env.example`에 `DATABASE_URL`, `JWT_SECRET`, `PORT`, `BCRYPT_SALT_ROUNDS` 키 정의 완료
- [x] `server.js`에서 `app.js`를 import하여 `node server.js` 기동 확인
- [x] `.gitignore`에 `.env`, `node_modules` 제외 설정 완료

**의존성:** 없음
**예상 소요:** 30분

---

### BE-02. 공통 인프라 구현

**설명:** 모든 도메인 레이어가 공유하는 PostgreSQL 커넥션 풀, AppError, errorHandler, jwtUtils, hashPassword를 구현하여 공통 기반을 확립한다.

**완료 조건:**
- [x] `db/pool.js`에서 pg Pool 싱글턴 생성 및 `DATABASE_URL` 환경변수로 연결, `query` 헬퍼 함수 export 완료
- [x] `utils/AppError.js`에 `statusCode`, `code`, `message` 필드를 갖는 커스텀 Error 클래스 구현
- [x] `middlewares/errorHandler.js`에서 `{ error: { code, message } }` 표준 형식으로 응답 처리 완료
- [x] `utils/jwtUtils.js`에 HS-512 알고리즘으로 `sign` / `verify` 함수 구현 및 만료 시간 설정
- [x] `utils/hashPassword.js`에 bcrypt salt 12 이상으로 `hash` / `compare` 함수 구현
- [x] `app.js`에 `express.json()` 파서 및 `errorHandler` 최하단 등록 완료

**의존성:** BE-01 완료 후
**예상 소요:** 1시간

---

### BE-03. authenticate 미들웨어 구현

**설명:** `Authorization: Bearer {token}` 헤더를 검증하여 `req.user`에 페이로드를 주입하는 인증 미들웨어를 구현한다. (FR-CMN-01)

**완료 조건:**
- [x] 토큰 누락 시 401 / `UNAUTHORIZED` 응답 처리
- [x] `jwtUtils.verify` 호출로 만료·위변조 시 401 응답 처리
- [x] 검증 성공 시 `req.user = { id, email }` 설정 후 `next()` 호출
- [x] `middlewares/authenticate.js`에서 named export로 제공

**의존성:** BE-02 완료 후
**예상 소요:** 30분

---

### BE-04. DB 연결 및 마이그레이션 검증

**설명:** `db/pool.js`가 `database/schema.sql`과 연동되어 정상 동작하는지 확인하고, 백엔드에서 DB 연결 상태를 검증한다.

**완료 조건:**
- [x] `pool.query('SELECT NOW()')` 호출로 DB 연결 정상 동작 확인
- [x] `users`, `categories`, `todos` 테이블에 대한 단순 SELECT 쿼리 성공 확인
- [x] `.env`의 `DATABASE_URL` 미설정 시 서버 시작 시 오류 메시지 출력 확인
- [x] `db/pool.js`가 연결 오류 시 `console.error`로 로그를 남기는 로직 포함

**의존성:** BE-02 완료 후, DB-02 완료 후
**예상 소요:** 30분

---

### BE-05. 인증 도메인 구현 (FR-AUTH-01 ~ FR-AUTH-05)

**설명:** 회원가입, 로그인, 로그아웃, 회원탈퇴, 비밀번호 변경 5개 엔드포인트의 Repository / Service / Controller / Router 전 레이어를 구현한다.

**완료 조건:**
- [x] `repositories/userRepository.js`에 `findByEmail`, `createUser`, `deleteUser`, `updatePassword` Parameterized Query 함수 구현
- [x] `services/authService.js`에 register(중복 이메일 409), login(자격증명 검증 후 JWT 발급), deleteAccount(Hard Delete), changePassword(현재 비밀번호 확인 → 갱신) 비즈니스 로직 구현
- [x] `controllers/authController.js`에서 req 파싱 → service 호출 → 표준 응답 반환 구조 완료
- [x] `routes/authRouter.js`에 `POST /register`, `POST /login`, `POST /logout`, `DELETE /account`, `PATCH /password` 등록 및 인증 필요 라우트에 `authenticate` 적용
- [x] `app.js`에 `/api/auth` 경로로 `authRouter` 마운트 완료
- [x] 입력값 검증(이메일 형식, 비밀번호 최소 8자) 미들웨어 적용

**의존성:** BE-03, BE-04 완료 후
**예상 소요:** 2시간 30분

---

### BE-06. 할일 도메인 구현 (FR-TODO-01 ~ FR-TODO-06)

**설명:** 할일 목록 조회, 단건 조회, 생성, 수정, 상태변경, 삭제 6개 엔드포인트의 Repository / Service / Controller / Router 전 레이어를 구현한다.

**완료 조건:**
- [x] `repositories/todoRepository.js`에 `findAllByUserId`(status·categoryId 필터 지원), `findByIdAndUserId`, `create`, `update`, `updateStatus`, `deleteById` Parameterized Query 구현
- [x] `services/todoService.js`에 소유권 검증(타 사용자 접근 시 403), 미존재 todo 404, COMPLETED 처리 시 `completedAt` 기록 / PENDING 복구 시 null 처리 로직 구현 (BR-TODO-02)
- [x] `controllers/todoController.js`에서 `req.user.id` 기반 사용자 격리 및 표준 응답 반환 구조 완료
- [x] `routes/todoRouter.js`에 `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `PATCH /:id/status`, `DELETE /:id` 등록 및 전체 라우트에 `authenticate` 적용
- [x] 입력값 검증(title 필수·공백 불가, status enum 값) 미들웨어 적용
- [x] `app.js`에 `/api/todos` 경로로 `todoRouter` 마운트 완료

**의존성:** BE-03, BE-04 완료 후
**예상 소요:** 2시간

---

### BE-07. 카테고리 도메인 구현 (FR-CAT-01 ~ FR-CAT-04)

**설명:** 카테고리 목록 조회, 생성, 수정, 삭제 4개 엔드포인트의 Repository / Service / Controller / Router 전 레이어를 구현한다.

**완료 조건:**
- [x] `repositories/categoryRepository.js`에 `findAllByUserId`, `findByIdAndUserId`, `create`, `update`, `deleteById` Parameterized Query 구현
- [x] `services/categoryService.js`에 소유권 검증(403), 미존재 카테고리 404, 동일 사용자 내 중복 카테고리명 409 처리 구현 (BR-CAT-01)
- [x] 카테고리 삭제 시 DB의 `ON DELETE SET NULL`에 의해 연결된 todos의 `category_id`가 자동 null 처리됨을 확인 (BR-CAT-02)
- [x] `routes/categoryRouter.js`에 `GET /`, `POST /`, `PUT /:id`, `DELETE /:id` 등록 및 전체 라우트에 `authenticate` 적용
- [x] 입력값 검증(name 필수·공백 불가) 미들웨어 적용
- [x] `app.js`에 `/api/categories` 경로로 `categoryRouter` 마운트 완료

**의존성:** BE-03, BE-04 완료 후
**예상 소요:** 1시간 30분

---

### BE-08. API 통합 테스트 (Jest + supertest)

**설명:** Jest + supertest로 인증 플로우 및 핵심 CRUD 경로의 통합 테스트를 작성하여 회귀를 방지한다.

**완료 조건:**
- [x] 테스트 DB 연결 설정 및 각 suite 실행 전후 `TRUNCATE ... CASCADE` 초기화 구조 완료
- [x] 인증 테스트: 회원가입 성공/중복 이메일 409, 로그인 성공 201/불일치 401, 미인증 보호 라우트 접근 401 검증
- [x] Todo CRUD 테스트: 생성 201, 목록 조회 200(필터 포함), 단건 조회 200/404, 수정 200, 상태변경 200, 삭제 200, 타 사용자 접근 403 검증
- [x] Category CRUD 테스트: 생성 201, 목록 조회 200, 수정 200, 삭제 200, 중복명 409, 타 사용자 접근 403 검증
- [x] `npm test` 실행 시 모든 테스트 통과

**의존성:** BE-05, BE-06, BE-07 완료 후
**예상 소요:** 2시간

---

## 3. FE 영역 실행계획

### FE-01. 프로젝트 초기화 및 개발 환경 구성

**설명:** Vite + React 19 프로젝트를 생성하고 TanStack Query, Zustand, Tailwind CSS, ESLint, Prettier를 설치 및 설정한다.

**완료 조건:**
- [ ] `npm run dev`로 개발 서버 정상 기동 확인
- [ ] Tailwind CSS 유틸리티 클래스 렌더링 반영 확인
- [ ] `QueryClientProvider`가 `main.jsx`에 등록됨
- [ ] Zustand 패키지 설치 완료
- [ ] `.env.example`에 `VITE_API_BASE_URL` 정의, `.env`는 `.gitignore` 등록
- [ ] `npm run lint` 오류 없이 통과

**의존성:** 없음
**예상 소요:** 1시간

---

### FE-02. API 클라이언트 및 Zustand authStore 구현

**설명:** axios 인스턴스에 요청 인터셉터(JWT 자동 첨부)와 응답 인터셉터(401 시 토큰 폐기·리다이렉트)를 구성하고, `authStore.js`를 정의한다.

**완료 조건:**
- [ ] `api/client.js`에서 `VITE_API_BASE_URL` 기반 axios 인스턴스 생성
- [ ] 요청 인터셉터가 authStore의 `token`을 읽어 `Authorization: Bearer` 헤더 자동 첨부
- [ ] 응답 인터셉터가 401 수신 시 `clearAuth()` 호출 후 로그인 경로 리다이렉트
- [ ] `authStore.js`에 `token`, `user`, `setAuth(token, user)`, `clearAuth()` 구현
- [ ] `authApi.js`, `todoApi.js`, `categoryApi.js`에 도메인별 API 함수 구현
- [ ] `constants/queryKeys.js`에 쿼리 키 상수 중앙 정의

**의존성:** FE-01 완료 후
**예상 소요:** 1시간 30분

---

### FE-03. 라우터 및 인증 가드 구현

**설명:** React Router로 전체 라우트를 정의하고, 미인증 접근 시 로그인 페이지로 리다이렉트하는 인증 가드(PrivateRoute)를 구현한다.

**완료 조건:**
- [ ] `router/index.jsx`에 6개 페이지 라우트 정의 (LoginPage, RegisterPage, TodoListPage, TodoDetailPage, CategoryPage, AccountPage)
- [ ] 미인증 접근 시 `/login`으로 리다이렉트
- [ ] `/login`, `/register`는 인증 없이 접근 가능
- [ ] 인증 상태에서 `/login` 접근 시 `/todos`로 리다이렉트
- [ ] 루트 경로(`/`)가 `/todos`로 리다이렉트

**의존성:** FE-02 완료 후
**예상 소요:** 1시간

---

### FE-04. 공통 컴포넌트 구현

**설명:** 전체 화면에서 재사용되는 `Button`, `Input`, `Modal`, `LoadingSpinner` 컴포넌트를 Tailwind CSS 기반으로 구현한다.

**완료 조건:**
- [ ] `Button.jsx`가 `variant`(primary, secondary, danger), `disabled`, `isLoading` props 지원, 로딩 중 클릭 차단
- [ ] `Input.jsx`가 `label`, `error`, `type` props 지원, 에러 메시지 하단 표시
- [ ] `Modal.jsx`가 `isOpen`, `onClose`, `title`, `children` props 지원, ESC 키·오버레이 클릭으로 닫기
- [ ] `LoadingSpinner.jsx`가 화면 중앙에 스피너 렌더링
- [ ] 모바일(375px)과 데스크탑(1280px) 양쪽에서 레이아웃 정상 확인

**의존성:** FE-01 완료 후
**예상 소요:** 1시간 30분

---

### FE-05. 유틸 함수 및 useAuth 훅 구현

**설명:** 이메일·비밀번호 유효성 검사(`validationUtils.js`), 날짜 처리 및 Overdue 판단(`dateUtils.js`), `useAuth.js` 훅을 구현한다.

**완료 조건:**
- [ ] `validationUtils.js`에 이메일 형식 검증, 비밀번호 최소 8자 검증 함수 구현
- [ ] `dateUtils.js`에 `isOverdue(dueDate, status)` 함수 구현 (`dueDate < Date.now() && status === 'PENDING'`)
- [ ] `dateUtils.js`에 날짜 포맷 함수 구현 (예: `2026-04-30 18:00`)
- [ ] `useAuth.js`가 login, logout, register 액션을 TanStack Query Mutation + authStore 조합으로 제공
- [ ] login 성공 시 `setAuth()` 호출 후 `/todos`로 이동, logout 시 `clearAuth()` 호출 후 `/login`으로 이동

**의존성:** FE-02 완료 후
**예상 소요:** 1시간

---

### FE-06. 로그인 및 회원가입 페이지 구현

**설명:** `LoginPage.jsx`와 `RegisterPage.jsx`를 구현한다. 클라이언트 유효성 검증 후 API 오류 응답을 한국어 메시지로 표시한다. (SC-01)

**완료 조건:**
- [ ] 이메일·비밀번호 폼 렌더링, 제출 전 `validationUtils` 클라이언트 검증 수행
- [ ] 비밀번호 8자 미만 시 "비밀번호는 최소 8자 이상이어야 합니다" 표시
- [ ] 중복 이메일 가입(409) 시 "이미 사용 중인 이메일입니다" 표시
- [ ] 로그인 실패(401) 시 "이메일 또는 비밀번호가 올바르지 않습니다" 표시
- [ ] 회원가입 성공 후 로그인 페이지로, 로그인 성공 후 `/todos`로 이동
- [ ] 로그인 ↔ 회원가입 페이지 간 이동 링크 제공

**의존성:** FE-04, FE-05 완료 후
**예상 소요:** 1시간 30분

---

### FE-07. 할일 TanStack Query 훅 구현

**설명:** 할일 관련 서버 상태를 관리하는 TanStack Query 훅 전체를 구현하고, Mutation 성공 시 쿼리 무효화로 목록을 자동 갱신한다.

**완료 조건:**
- [ ] `useTodosQuery.js`가 `status`, `categoryId` 필터를 queryKey에 포함, 필터 변경 시 자동 재요청
- [ ] `useTodoQuery.js`가 단건 할일 상세 조회
- [ ] `useCreateTodoMutation`, `useUpdateTodoMutation`, `useDeleteTodoMutation`, `useToggleTodoMutation` 각 Mutation 성공 시 todos 쿼리 키 `invalidateQueries` 수행
- [ ] `queryKeys.js` 상수를 모든 훅에서 일관되게 사용
- [ ] Mutation 실행 중 `isPending` 상태 반환

**의존성:** FE-02 완료 후
**예상 소요:** 1시간 30분

---

### FE-08. 할일 목록 페이지 구현 (필터 및 Overdue 시각화)

**설명:** `TodoListPage.jsx`, `TodoList.jsx`, `TodoItem.jsx`, `TodoFilter.jsx`를 구현한다. 상태·카테고리 필터를 즉시 적용하고, Overdue 할일을 시각적으로 명확히 구분 표시한다. (SC-03, SC-06)

**완료 조건:**
- [ ] 상태 필터(전체/미완료/완료)와 카테고리 필터가 페이지 이동 없이 즉시 목록 반영
- [ ] Overdue 항목(`isOverdue()` 충족)을 빨간색 테두리 또는 경고 아이콘으로 일반 PENDING과 시각 구분
- [ ] PENDING / COMPLETED / Overdue 3가지 상태가 색상 또는 아이콘으로 즉시 식별 가능
- [ ] 할일 없을 때 빈 상태 안내 메시지 표시
- [ ] 목록 로딩 중 `LoadingSpinner` 표시
- [ ] "할일 추가" 버튼 클릭 시 생성 폼 열림

**의존성:** FE-04, FE-07 완료 후
**예상 소요:** 2시간

---

### FE-09. 할일 생성/수정/삭제/상태변경 구현

**설명:** `TodoForm.jsx`로 생성과 수정을 통합 처리하고, 삭제 시 확인 Modal을 표시한다. 상태 변경 토글은 즉시 처리한다. (SC-03, SC-04, SC-05, SC-07)

**완료 조건:**
- [ ] `TodoForm.jsx`가 생성/수정 `mode` prop으로 구분, 수정 시 기존 값 선행 입력
- [ ] 제목 비어있거나 공백만 입력 시 "할일 제목을 입력해 주세요" 표시 후 API 호출 차단
- [ ] 카테고리 드롭다운이 `useCategoriesQuery` 기반으로 렌더링, 미선택(null) 옵션 포함
- [ ] `dueDate` 입력 필드 `datetime-local` 타입으로 제공
- [ ] 삭제 버튼 클릭 시 확인 Modal 표시 후 확인 시에만 `useDeleteTodoMutation` 호출
- [ ] 완료 체크 버튼 클릭 시 `useToggleTodoMutation` 즉시 호출, PENDING ↔ COMPLETED 전환 및 목록 갱신

**의존성:** FE-04, FE-07, FE-08 완료 후
**예상 소요:** 2시간

---

### FE-10. 할일 상세 페이지 구현

**설명:** `TodoDetailPage.jsx`를 구현하여 개별 할일 전체 정보를 표시하고, 수정 및 삭제를 처리한다. 존재하지 않는 ID 접근 시 에러 처리를 포함한다. (SC-04)

**완료 조건:**
- [ ] URL 파라미터 `id`로 `useTodoQuery` 호출, 제목·설명·카테고리·종료일·상태·생성일 표시
- [ ] 404 응답 시 "존재하지 않는 할일입니다" 메시지 및 목록 화면 안내 링크 제공
- [ ] 수정 버튼 클릭 시 기존 값이 채워진 `TodoForm.jsx` 열림
- [ ] 수정 완료 후 상세 화면에 변경 값 즉시 반영 (쿼리 무효화 후 자동 재조회)
- [ ] 삭제 완료 후 `/todos` 목록 페이지로 이동

**의존성:** FE-07, FE-09 완료 후
**예상 소요:** 1시간

---

### FE-11. 카테고리 TanStack Query 훅 구현

**설명:** 카테고리 관련 서버 상태를 관리하는 TanStack Query 훅을 구현한다. 카테고리 삭제 성공 시 todos 쿼리도 함께 무효화한다. (BR-CAT-02)

**완료 조건:**
- [ ] `useCategoriesQuery.js`가 로그인 사용자의 카테고리 목록 조회 및 캐싱
- [ ] `useCreateCategoryMutation`, `useUpdateCategoryMutation` 성공 시 categories 쿼리 무효화
- [ ] `useDeleteCategoryMutation` 성공 시 categories + todos 쿼리 모두 무효화
- [ ] 중복 카테고리명(409) 에러가 호출 측으로 전달됨

**의존성:** FE-02 완료 후
**예상 소요:** 1시간

---

### FE-12. 카테고리 관리 페이지 구현

**설명:** `CategoryPage.jsx`, `CategoryList.jsx`, `CategoryItem.jsx`, `CategoryForm.jsx`를 구현하여 카테고리 생성/수정/삭제 흐름을 구성한다. (SC-02)

**완료 조건:**
- [ ] 카테고리 목록이 `useCategoriesQuery` 데이터 기반으로 렌더링
- [ ] 이름 비어있거나 공백 시 "카테고리 이름을 입력해 주세요" 표시 후 API 호출 차단
- [ ] 중복 이름(409) 시 "이미 사용 중인 카테고리 이름입니다" 표시
- [ ] 수정 버튼 클릭 시 기존 이름이 채워진 수정 폼 표시, 저장 시 `useUpdateCategoryMutation` 호출
- [ ] 삭제 버튼 클릭 시 확인 후 `useDeleteCategoryMutation` 호출 및 목록 갱신

**의존성:** FE-04, FE-11 완료 후
**예상 소요:** 1시간 30분

---

### FE-13. 계정 설정 페이지 구현 (비밀번호 변경, 회원탈퇴)

**설명:** `AccountPage.jsx`에 비밀번호 변경 폼과 회원탈퇴 섹션을 구현한다. 성공 시 토큰을 폐기하고 로그인 화면으로 이동한다. (SC-09, SC-10)

**완료 조건:**
- [ ] 비밀번호 변경 폼: 현재 비밀번호, 새 비밀번호, 새 비밀번호 확인 3개 인풋 구성
- [ ] 새 비밀번호 확인 불일치 시 "새 비밀번호가 일치하지 않습니다", 8자 미만 시 "비밀번호는 최소 8자 이상이어야 합니다" 클라이언트 즉시 표시
- [ ] 현재 비밀번호 불일치(401) 시 "현재 비밀번호가 올바르지 않습니다", 기존과 동일(400) 시 "현재 비밀번호와 다른 비밀번호를 입력해 주세요" 표시
- [ ] 변경 성공 후 `clearAuth()` 호출 및 로그인 페이지 이동
- [ ] 회원탈퇴 버튼 클릭 시 "계정과 모든 데이터(할일, 카테고리)가 영구 삭제됩니다. 탈퇴하시겠습니까?" 확인 Modal 표시
- [ ] 탈퇴 성공 후 `clearAuth()` 호출 및 로그인 페이지 이동

**의존성:** FE-04, FE-05, FE-06 완료 후
**예상 소요:** 1시간 30분

---

### FE-14. 반응형 레이아웃 검증 및 전체 통합 점검

**설명:** 모바일(375px)과 데스크탑(1280px) 기준으로 모든 페이지 레이아웃을 점검하고, 인증 플로우 전체를 엔드-투-엔드로 수동 검증한다.

**완료 조건:**
- [ ] 6개 전체 페이지가 375px에서 가로 스크롤 없이 렌더링
- [ ] 1280px 데스크탑 해상도에서 콘텐츠 가독성 및 여백 적절함 확인
- [ ] 인증 플로우 전체(SC-01 → SC-02 → SC-03 → SC-05 → SC-06 → SC-08 → SC-09 또는 SC-10) 수동 실행 및 화면 전환·데이터 갱신 정상 확인
- [ ] 로딩 상태와 에러 상태 UI가 모든 주요 페이지에서 노출됨 확인
- [ ] `npm run lint` 경고 및 오류 없이 통과

**의존성:** FE-06, FE-08, FE-09, FE-10, FE-12, FE-13 완료 후
**예상 소요:** 1시간

---

*본 문서는 PRD v1.1, 프로젝트 구조 설계 원칙 v1.1, ERD v1.0을 기반으로 작성되었습니다.*
