# 프로젝트 구조 설계 원칙

**버전:** 1.0
**작성일:** 2026-04-28
**작성자:** Fullstack Architect
**참조 문서:** `docs/2-prd.md` v1.1, `docs/1-domain-definition.md` v1.1

---

## 변경 이력

| 버전 | 변경일 | 작성자 | 변경 내용 |
|------|--------|--------|-----------|
| 1.0 | 2026-04-28 | Fullstack Architect | 최초 작성 |
| 1.1 | 2026-04-28 | Fullstack Architect | 최상위 공통 원칙에 환경 변수 분리 원칙 추가 |

---

## 1. 최상위 공통 원칙

다음 원칙은 Frontend·Backend 모두에 적용된다.

**관심사 분리 (Separation of Concerns)**
- UI 렌더링, 상태 관리, API 통신, 비즈니스 로직, 데이터 접근은 각각 분리된 파일/모듈로 관리한다.
- 한 파일이 두 가지 이상의 책임을 가지면 분리를 검토한다.

**단방향 의존성**
- 상위 레이어가 하위 레이어를 호출한다. 역방향 호출은 금지한다.
- 같은 레이어끼리의 직접 호출도 원칙적으로 금지한다. (공통 유틸 모듈 제외)

**단일 책임 (Single Responsibility)**
- 함수 하나는 한 가지 일만 한다.
- 함수가 100줄을 초과하면 분리를 검토한다.

**하드코딩 금지**
- URL, 포트, 시크릿 키, DB 접속 정보 등은 반드시 환경 변수(.env)로 분리한다.

**JavaScript 전용**
- TypeScript를 사용하지 않는다. JSDoc 주석으로 타입 의도를 명시한다.
- ORM을 사용하지 않는다. pg 라이브러리로 SQL을 직접 작성한다.

**Phase 1 MVP 실용주의**
- 과도한 추상화를 피한다. 지금 필요한 것만 만든다.
- 중복이 2회 이상 발생할 때 공통화를 고려한다. (AHA 원칙)

**환경 변수 분리**
- URL, 포트, 시크릿 키, DB 접속 정보 등 환경별로 달라지는 값은 반드시 `.env` 파일로 분리한다.
- `.env` 파일은 `.gitignore`에 등록하여 저장소에 커밋하지 않는다.
- `.env.example` 파일을 커밋하여 필요한 환경 변수 키 목록을 팀 전체에 공유한다.
- Frontend와 Backend의 환경 변수는 각 디렉토리에서 독립적으로 관리한다.
- `development` / `production` / `test` 환경을 `NODE_ENV`로 구분하며, 환경별 `.env` 파일(`.env.test` 등)을 분리한다.

---

## 2. 의존성/레이어 원칙

### Frontend 레이어 구조

```
UI 컴포넌트 (pages / components)
    ↓ 호출
커스텀 훅 / TanStack Query 훅 (hooks / queries)
    ↓ 호출
API 클라이언트 함수 (api)
    ↓ HTTP 요청
[Backend API]

Zustand 스토어 (stores)  ←  UI 컴포넌트 / 훅이 직접 접근
```

- `pages`와 `components`는 `hooks`, `queries`, `stores`, `api`를 호출할 수 있다.
- `api` 함수는 axios/fetch 호출만 담당하며, UI 렌더링 로직이나 상태 관리 코드를 포함하지 않는다.
- `stores`(Zustand)는 클라이언트 전역 상태(JWT 토큰, 로그인 사용자 정보 등)만 관리한다. 서버 데이터 캐싱은 TanStack Query가 담당한다.
- `queries`는 TanStack Query의 `useQuery` / `useMutation` 훅을 wrapping한다. API 함수를 직접 호출한다.

**금지 사항**
- `api` 함수 내에서 Zustand store에 직접 접근 금지
- `pages` 컴포넌트 내에서 fetch/axios를 직접 호출 금지
- TanStack Query 훅과 Zustand store를 동일 데이터에 중복 사용 금지

### Backend 레이어 구조

```
Router (routes/)
    ↓ 요청 라우팅
Middleware (middlewares/)   ← 인증, 유효성 검증
    ↓
Controller (controllers/)
    ↓ 비즈니스 조율
Service (services/)
    ↓ 비즈니스 로직
Repository (repositories/)
    ↓ SQL 실행
PostgreSQL (pg)
```

- `Router`는 URL 패턴과 HTTP 메서드를 정의하고, 미들웨어와 컨트롤러를 연결한다.
- `Controller`는 req/res를 처리하고 Service를 호출한다. SQL 코드와 비즈니스 로직을 포함하지 않는다.
- `Service`는 비즈니스 규칙을 구현한다. req/res 객체에 접근하지 않는다.
- `Repository`는 SQL 쿼리 실행만 담당한다. 비즈니스 판단 로직을 포함하지 않는다.

**금지 사항**
- Controller에서 pg pool을 직접 호출 금지
- Repository에서 HTTP 상태 코드를 결정하거나 res 객체에 접근 금지
- Service에서 req/res 객체를 파라미터로 받거나 반환 금지

---

## 3. 코드/네이밍 원칙

### 파일명 규칙

| 분류 | 규칙 | 예시 |
|------|------|------|
| React 컴포넌트 | PascalCase, `.jsx` | `TodoItem.jsx`, `LoginForm.jsx` |
| 페이지 컴포넌트 | PascalCase + `Page` 접미사, `.jsx` | `TodoListPage.jsx`, `LoginPage.jsx` |
| 커스텀 훅 | camelCase, `use` 접두사, `.js` | `useAuth.js`, `useTodoList.js` |
| TanStack Query 훅 | camelCase, `use` 접두사 + `Query`/`Mutation`, `.js` | `useTodosQuery.js`, `useCreateTodoMutation.js` |
| Zustand 스토어 | camelCase + `Store`, `.js` | `authStore.js` |
| API 클라이언트 함수 | camelCase + 도메인명, `.js` | `todoApi.js`, `authApi.js`, `categoryApi.js` |
| Backend 라우터 | camelCase + `Router`, `.js` | `todoRouter.js`, `authRouter.js` |
| Backend 컨트롤러 | camelCase + `Controller`, `.js` | `todoController.js`, `authController.js` |
| Backend 서비스 | camelCase + `Service`, `.js` | `todoService.js`, `authService.js` |
| Backend 레포지토리 | camelCase + `Repository`, `.js` | `todoRepository.js`, `userRepository.js` |
| 미들웨어 | camelCase, `.js` | `authenticate.js`, `validate.js` |
| 공통 유틸 | camelCase, `.js` | `errorHandler.js`, `hashPassword.js` |

### 함수/변수명 규칙

- 함수명: camelCase 동사+명사 (`getTodos`, `createCategory`, `validateEmail`)
- 변수명: camelCase 명사 (`todoList`, `currentUser`, `categoryId`)
- 상수: UPPER_SNAKE_CASE (`JWT_SECRET`, `SALT_ROUNDS`, `TOKEN_EXPIRY`)
- React 컴포넌트: PascalCase (`TodoItem`, `CategoryFilter`)
- Boolean 변수: `is`, `has`, `can` 접두사 (`isLoading`, `hasError`, `canDelete`)

### Frontend 네이밍 상세

```js
// 컴포넌트 - PascalCase
function TodoItem({ todo, onToggle }) { ... }

// 커스텀 훅 - use + 동사/명사
function useAuth() { ... }

// TanStack Query 훅
function useTodosQuery(filters) { ... }
function useCreateTodoMutation() { ... }

// Zustand 스토어
const useAuthStore = create((set) => ({ ... }));

// API 함수 - 도메인별 객체로 묶기
const todoApi = {
  getTodos: (params) => { ... },
  createTodo: (data) => { ... },
  updateTodo: (id, data) => { ... },
  deleteTodo: (id) => { ... },
  toggleTodoStatus: (id) => { ... },
};
```

### Backend 네이밍 상세

```js
// 라우터 - express.Router() 사용
const todoRouter = express.Router();
todoRouter.get('/', authenticate, todoController.getTodos);

// 컨트롤러 - req/res 처리
const todoController = {
  getTodos: async (req, res, next) => { ... },
  createTodo: async (req, res, next) => { ... },
};

// 서비스 - 비즈니스 로직
const todoService = {
  getTodos: async (userId, filters) => { ... },
  createTodo: async (userId, data) => { ... },
};

// 레포지토리 - SQL 실행
const todoRepository = {
  findAllByUserId: async (userId, filters) => { ... },
  create: async (data) => { ... },
};
```

### 에러 처리 컨벤션

- 모든 비동기 라우트 핸들러는 `try-catch`로 감싸고 `next(error)`로 에러를 전달한다.
- 에러 응답 구조는 전 API에서 동일한 형태를 유지한다.

```js
// 에러 응답 표준 구조
{
  "error": {
    "code": "DUPLICATE_EMAIL",
    "message": "이미 사용 중인 이메일입니다."
  }
}

// HTTP 상태 코드 사용 기준
// 200 OK           - 조회, 수정, 삭제 성공
// 201 Created      - 생성 성공
// 400 Bad Request  - 입력값 유효성 오류
// 401 Unauthorized - 인증 실패 또는 토큰 없음/만료
// 403 Forbidden    - 인증은 됐으나 권한 없음 (타인 데이터 접근)
// 404 Not Found    - 리소스 없음
// 409 Conflict     - 중복 데이터 (이메일, 카테고리명)
// 500 Internal     - 서버 내부 오류
```

- `400`, `401`, `403`, `404`, `409`는 개발자가 명시적으로 throw한다.
- `500`은 중앙 에러 핸들러(`errorHandler.js`)가 처리한다.

---

## 4. 테스트/품질 원칙

### Phase 1 MVP 테스트 범위

3일 일정을 고려하여 핵심 API 엔드포인트 중심으로 통합 테스트를 작성한다. 전체 커버리지 수치보다 "실패 시 치명적인 경로"를 우선한다.

**필수 테스트 대상 (Phase 1)**
- 인증 플로우: 회원가입, 로그인, 토큰 검증, 비밀번호 변경
- 데이터 소유권 검증: 타인 데이터 접근 시 403 반환
- 할일 CRUD 핵심 경로: 생성, 목록 조회(필터), 상태 변경, 삭제
- 카테고리 삭제 연쇄 처리: 연결된 할일의 categoryId null 처리 확인

**생략 가능 (Phase 1)**
- 프론트엔드 컴포넌트 단위 테스트
- 부하 테스트 및 성능 벤치마크
- E2E 테스트

**테스트 도구**
- Backend: Jest + supertest (API 통합 테스트)
- 테스트 DB: 별도 PostgreSQL 테스트 데이터베이스 사용 (`.env.test` 분리)

### 코드 품질 기준

- ESLint: `eslint:recommended` 기준 적용 (Frontend/Backend 각각 설정)
- Prettier: 프로젝트 루트 `.prettierrc` 단일 설정 공유
- 커밋 전 lint 오류가 없어야 한다. (CI 없이도 로컬에서 `npm run lint` 확인)

```json
// .prettierrc 권장 설정
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

## 5. 설정/보안/운영 원칙

### 환경 변수 관리

- `.env` 파일은 반드시 `.gitignore`에 등록한다.
- `.env.example` 파일을 커밋하여 필요한 키 목록을 문서화한다.
- Backend와 Frontend의 환경 변수는 각 디렉토리에서 분리 관리한다.

```
# backend/.env.example
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/todolista
JWT_SECRET=your-strong-secret-key-here
JWT_EXPIRES_IN=1h
BCRYPT_SALT_ROUNDS=12

# frontend/.env.example
VITE_API_BASE_URL=http://localhost:3000/api
```

### JWT 보안 규칙

- 알고리즘: HS-512 고정
- 만료 시간: `1h` (액세스 토큰)
- `JWT_SECRET`은 최소 32자 이상의 무작위 문자열을 사용한다.
- 클라이언트는 토큰을 `localStorage` 또는 `sessionStorage`에 저장한다. (Phase 1 기준, XSS 위협이 낮은 환경 가정)
- 토큰 페이로드에 비밀번호, 민감 PII(주민번호 등)를 포함하지 않는다.
- 비밀번호 변경 후 기존 토큰은 클라이언트에서 즉시 폐기하고 재로그인을 유도한다. (Stateless 구조이므로 서버 블랙리스트 없이 클라이언트 삭제로 처리)

### SQL Parameterized Query 강제

- pg 라이브러리의 `$1, $2, ...` 파라미터 바인딩을 반드시 사용한다.
- 사용자 입력값을 SQL 문자열에 직접 연결(`+` 또는 템플릿 리터럴)하는 것을 금지한다.

```js
// 올바른 예
const result = await pool.query(
  'SELECT * FROM todos WHERE user_id = $1 AND id = $2',
  [userId, todoId]
);

// 금지 - SQL Injection 위험
const result = await pool.query(
  `SELECT * FROM todos WHERE user_id = '${userId}'`
);
```

### bcrypt 규칙

- `BCRYPT_SALT_ROUNDS`는 최소 12 이상을 사용한다.
- 평문 비밀번호를 DB에 저장하거나 로그에 출력하지 않는다.
- 비밀번호 비교는 반드시 `bcrypt.compare()`를 사용한다. 해시값 직접 비교 금지.

### 로그 원칙

- 에러 로그는 반드시 남긴다. `console.error(err)` 최소 기준.
- 요청/응답 로그에 JWT 토큰 전체, 비밀번호, 이메일 등 민감 정보를 포함하지 않는다.
- `500` 에러는 클라이언트에 내부 스택 트레이스를 반환하지 않는다. 서버 로그에만 기록한다.

```js
// 중앙 에러 핸들러 패턴
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.status || 500} - ${err.message}`, err.stack);
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.status ? err.message : '서버 오류가 발생했습니다.',
    },
  });
});
```

---

## 6. 프론트엔드 디렉토리 구조

### 기술 기반

React 19 + TanStack Query + Zustand + Tailwind CSS + Vite, JavaScript

### 디렉토리 트리

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                        # API 클라이언트 함수 (axios 호출)
│   │   ├── client.js               # axios 인스턴스 생성 및 인터셉터 설정
│   │   ├── authApi.js              # 회원가입, 로그인, 비밀번호 변경, 회원탈퇴
│   │   ├── todoApi.js              # 할일 CRUD, 상태 변경
│   │   └── categoryApi.js          # 카테고리 CRUD
│   │
│   ├── queries/                    # TanStack Query 훅 (서버 상태 관리)
│   │   ├── useTodosQuery.js        # 할일 목록 조회 (useQuery)
│   │   ├── useTodoQuery.js         # 할일 상세 조회 (useQuery)
│   │   ├── useCategoriesQuery.js   # 카테고리 목록 조회 (useQuery)
│   │   ├── useCreateTodoMutation.js
│   │   ├── useUpdateTodoMutation.js
│   │   ├── useDeleteTodoMutation.js
│   │   ├── useToggleTodoMutation.js # 상태 변경 (PENDING <-> COMPLETED)
│   │   ├── useCreateCategoryMutation.js
│   │   ├── useUpdateCategoryMutation.js
│   │   └── useDeleteCategoryMutation.js
│   │
│   ├── stores/                     # Zustand 스토어 (클라이언트 전역 상태)
│   │   └── authStore.js            # 인증 토큰, 로그인 사용자 정보
│   │
│   ├── hooks/                      # 커스텀 훅 (재사용 로직)
│   │   ├── useAuth.js              # 로그인/로그아웃/회원가입 액션 조합
│   │   └── useOverdue.js           # Overdue 여부 판단 (dueDate < now && PENDING)
│   │
│   ├── pages/                      # 페이지 단위 컴포넌트 (라우트 단위)
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── TodoListPage.jsx        # 메인 화면 (할일 목록 + 필터)
│   │   ├── TodoDetailPage.jsx      # 할일 상세/수정
│   │   ├── CategoryPage.jsx        # 카테고리 관리
│   │   └── AccountPage.jsx         # 비밀번호 변경, 회원탈퇴
│   │
│   ├── components/                 # 재사용 UI 컴포넌트
│   │   ├── common/                 # 공통 컴포넌트
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── todo/                   # 할일 관련 컴포넌트
│   │   │   ├── TodoItem.jsx        # 목록 내 단일 할일 카드
│   │   │   ├── TodoList.jsx        # 할일 목록 컨테이너
│   │   │   ├── TodoForm.jsx        # 할일 생성/수정 폼
│   │   │   └── TodoFilter.jsx      # 상태/카테고리 필터 UI
│   │   └── category/               # 카테고리 관련 컴포넌트
│   │       ├── CategoryItem.jsx
│   │       ├── CategoryList.jsx
│   │       └── CategoryForm.jsx
│   │
│   ├── utils/                      # 순수 유틸 함수
│   │   ├── dateUtils.js            # 날짜 포맷, Overdue 판단 함수
│   │   └── validationUtils.js      # 이메일, 비밀번호 유효성 검사
│   │
│   ├── constants/                  # 상수 정의
│   │   └── queryKeys.js            # TanStack Query 쿼리 키 중앙 관리
│   │
│   ├── router/
│   │   └── index.jsx               # React Router 라우트 정의, 인증 가드
│   │
│   ├── App.jsx
│   └── main.jsx                    # Vite 진입점, QueryClientProvider 설정
│
├── .env
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

### 각 디렉토리 역할 요약

| 디렉토리 | 역할 |
|----------|------|
| `api/` | axios 인스턴스 및 도메인별 API 호출 함수. 서버와의 HTTP 통신만 담당. |
| `queries/` | TanStack Query `useQuery` / `useMutation` 훅. 서버 데이터 캐싱 및 동기화. |
| `stores/` | Zustand 스토어. JWT 토큰 등 서버 요청과 무관한 클라이언트 전역 상태만 관리. |
| `hooks/` | 여러 queries/stores를 조합하거나, 재사용되는 UI 로직을 추출한 커스텀 훅. |
| `pages/` | 라우트에 1:1 대응하는 페이지 컴포넌트. 레이아웃 구성과 데이터 훅 호출 담당. |
| `components/` | 페이지에서 분리된 재사용 UI 조각. props로만 동작하는 것을 원칙으로 한다. |
| `utils/` | 프레임워크 의존성 없는 순수 함수 모음. 날짜 처리, 유효성 검사 등. |
| `constants/` | 쿼리 키, 상태값 등 하드코딩을 피하기 위한 상수 정의. |
| `router/` | 라우트 구성 및 인증 가드 (비로그인 사용자 리다이렉트 처리). |

---

## 7. 백엔드 디렉토리 구조

### 기술 기반

Node.js 24 + Express 5 + pg (직접 SQL), JavaScript

### 디렉토리 트리

```
backend/
├── src/
│   ├── routes/                     # URL 라우팅 정의
│   │   ├── index.js                # 전체 라우터 조합 (app.use 등록)
│   │   ├── authRouter.js           # /api/auth/*
│   │   ├── todoRouter.js           # /api/todos/*
│   │   └── categoryRouter.js       # /api/categories/*
│   │
│   ├── controllers/                # req/res 처리, Service 호출
│   │   ├── authController.js       # 회원가입, 로그인, 로그아웃, 탈퇴, 비밀번호 변경
│   │   ├── todoController.js       # 할일 CRUD + 상태 변경
│   │   └── categoryController.js   # 카테고리 CRUD
│   │
│   ├── services/                   # 비즈니스 로직 (도메인 규칙 구현)
│   │   ├── authService.js          # bcrypt 비교, JWT 발급, 중복 이메일 검증
│   │   ├── todoService.js          # 소유권 검증, Overdue 계산, 상태 전이 규칙
│   │   └── categoryService.js      # 중복명 검증, 삭제 시 연쇄 처리
│   │
│   ├── repositories/               # SQL 쿼리 실행 (pg pool 직접 사용)
│   │   ├── userRepository.js       # users 테이블 CRUD
│   │   ├── todoRepository.js       # todos 테이블 CRUD
│   │   └── categoryRepository.js   # categories 테이블 CRUD
│   │
│   ├── middlewares/                # Express 미들웨어
│   │   ├── authenticate.js         # JWT 검증 미들웨어 (FR-CMN-01)
│   │   ├── validate.js             # 요청 바디/파라미터 유효성 검사
│   │   └── errorHandler.js         # 전역 에러 핸들러 (500 처리 포함)
│   │
│   ├── db/
│   │   ├── pool.js                 # pg Pool 싱글턴 생성 및 내보내기
│   │   └── migrations/             # SQL 마이그레이션 파일
│   │       ├── 001_create_users.sql
│   │       ├── 002_create_categories.sql
│   │       └── 003_create_todos.sql
│   │
│   ├── utils/                      # 공통 유틸 함수
│   │   ├── hashPassword.js         # bcrypt hash/compare 래퍼
│   │   ├── jwtUtils.js             # JWT sign/verify 래퍼
│   │   └── AppError.js             # 커스텀 에러 클래스 (status, code 포함)
│   │
│   └── app.js                      # Express 앱 설정 (미들웨어, 라우터 등록)
│
├── server.js                       # HTTP 서버 시작 진입점 (app.js import 후 listen)
├── .env
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
└── package.json
```

### 각 디렉토리 역할 요약

| 디렉토리/파일 | 역할 |
|--------------|------|
| `routes/` | URL 경로와 HTTP 메서드 정의. 미들웨어 체인과 컨트롤러 연결. |
| `controllers/` | req 파싱, res 반환 담당. 비즈니스 로직은 Service에 위임. |
| `services/` | 도메인 비즈니스 규칙 구현 (BR-* 규칙 적용 위치). req/res 비의존. |
| `repositories/` | Parameterized Query를 사용한 SQL 실행. DB 결과를 그대로 반환. |
| `middlewares/authenticate.js` | `Authorization: Bearer <token>` 헤더에서 JWT 추출 및 검증. 유효하면 `req.user`에 페이로드 설정. |
| `middlewares/validate.js` | 필수 필드 누락, 타입 오류 등 입력값 유효성 검사. 실패 시 400 반환. |
| `middlewares/errorHandler.js` | Service/Repository에서 throw된 에러를 최종 처리. `AppError`면 해당 status 사용, 아니면 500. |
| `db/pool.js` | `pg.Pool` 인스턴스를 싱글턴으로 생성. 모든 Repository가 이 pool을 import해서 사용. |
| `db/migrations/` | 테이블 생성 SQL 파일. 버전 순서대로 수동 또는 스크립트로 실행. |
| `utils/AppError.js` | `new AppError('메시지', 400, 'VALIDATION_ERROR')` 형태의 커스텀 에러. |
| `app.js` | `express()` 앱 인스턴스 생성, CORS, JSON 파서, 라우터 등록, 에러 핸들러 등록. |
| `server.js` | `app.listen()` 호출. 포트는 `process.env.PORT`에서 읽음. |

### API 엔드포인트 구조 요약

```
POST   /api/auth/register          - 회원가입 (FR-AUTH-01)
POST   /api/auth/login             - 로그인 (FR-AUTH-02)
POST   /api/auth/logout            - 로그아웃 (FR-AUTH-03) [authenticate 필요]
DELETE /api/auth/account           - 회원탈퇴 (FR-AUTH-04) [authenticate 필요]
PATCH  /api/auth/password          - 비밀번호 변경 (FR-AUTH-05) [authenticate 필요]

GET    /api/todos                  - 할일 목록 조회, ?status=&categoryId= (FR-TODO-02)
POST   /api/todos                  - 할일 생성 (FR-TODO-01)
GET    /api/todos/:id              - 할일 상세 조회 (FR-TODO-03)
PUT    /api/todos/:id              - 할일 수정 (FR-TODO-04)
PATCH  /api/todos/:id/status       - 할일 상태 변경 (FR-TODO-05)
DELETE /api/todos/:id              - 할일 삭제 (FR-TODO-06)

GET    /api/categories             - 카테고리 목록 조회 (FR-CAT-02)
POST   /api/categories             - 카테고리 생성 (FR-CAT-01)
PUT    /api/categories/:id         - 카테고리 수정 (FR-CAT-03)
DELETE /api/categories/:id         - 카테고리 삭제 (FR-CAT-04)
```

- `/api/todos/*` 및 `/api/categories/*` 전체는 `authenticate` 미들웨어 적용 필수.
- 모든 엔드포인트는 `req.user.id`를 기준으로 데이터를 필터링하여 소유권을 검증한다 (FR-CMN-02).

---

*본 문서는 PRD v1.1 및 도메인 정의서 v1.1을 기반으로 작성되었으며, Phase 1 MVP 범위에 한정한다.*
