# TodoList 애플리케이션 기술 아키텍처

**버전:** 1.0
**작성일:** 2026-04-28
**작성자:** Fullstack Architect
**참조 문서:** `docs/4-project-structure.md` v1.0, `docs/1-domain-definition.md` v1.1

---

## 변경 이력

| 버전 | 변경일 | 작성자 | 변경 내용 |
|------|--------|--------|-----------|
| 1.0 | 2026-04-28 | Fullstack Architect | 최초 작성 (4개 다이어그램) |

---

## 1. 전체 시스템 구성도

3-Tier 아키텍처에서 브라우저가 프론트엔드를 거쳐 백엔드로 요청하고, JWT 인증을 통과한 후 데이터베이스에 접근하는 전체 흐름을 표현합니다.

```mermaid
graph TD
    Browser["🌐 Browser<br/>React 19 App"]
    Frontend["Frontend<br/>Vite + TanStack Query<br/>+ Zustand"]
    APIGate["API Gateway<br/>/api/*"]
    Backend["Backend<br/>Node.js + Express"]
    Auth["JWT 인증<br/>HS-512"]
    DB["PostgreSQL<br/>Database"]
    
    Browser -->|HTML/CSS/JS| Frontend
    Frontend -->|API 요청<br/>Authorization: Bearer Token| APIGate
    APIGate -->|요청 라우팅| Backend
    Backend -->|JWT 검증| Auth
    Auth -->|토큰 유효| Backend
    Backend -->|SQL Query<br/>Parameterized| DB
    DB -->|결과| Backend
    Backend -->|JSON Response| Frontend
    Frontend -->|UI 업데이트| Browser
```

---

## 2. 백엔드 레이어 구조

요청이 라우터에서 시작되어 미들웨어, 컨트롤러, 서비스, 레포지토리를 거쳐 데이터베이스에 도달하는 계층적 구조를 표현합니다.

```mermaid
graph LR
    Request["HTTP 요청<br/>GET /api/todos"]
    Router["Router<br/>URL 매핑<br/>HTTP 메서드"]
    Middleware["Middleware<br/>authenticate<br/>JWT 검증"]
    Controller["Controller<br/>req/res 처리<br/>입력값 검증"]
    Service["Service<br/>비즈니스 로직<br/>도메인 규칙"]
    Repository["Repository<br/>SQL 쿼리<br/>DB 접근"]
    Database["PostgreSQL<br/>테이블 조회"]
    
    Request --> Router
    Router --> Middleware
    Middleware --> Controller
    Controller --> Service
    Service --> Repository
    Repository --> Database
```

---

## 3. 도메인 엔티티 관계도

사용자와 할일, 카테고리의 핵심 속성과 1:N 관계를 간단히 표현합니다.

```mermaid
erDiagram
    USER ||--o{ CATEGORY : creates
    USER ||--o{ TODO : creates
    CATEGORY ||--o{ TODO : contains

    USER {
        int id
        string email
        string password
        timestamp createdAt
    }

    CATEGORY {
        int id
        int userId
        string name
        timestamp createdAt
    }

    TODO {
        int id
        int userId
        int categoryId
        string title
        string status
        timestamp dueDate
        timestamp completedAt
    }
```

---

## 4. 인증 시퀀스 (로그인 ~ API 호출)

로그인으로 JWT 발급 후, 이후 API 요청에서 토큰을 검증하는 인증 흐름을 시간 순서대로 표현합니다.

```mermaid
sequenceDiagram
    participant Client as 클라이언트
    participant Backend as 백엔드
    participant DB as 데이터베이스
    
    Client->>Backend: POST /api/auth/login<br/>(email, password)
    activate Backend
    Backend->>DB: 이메일로 사용자 조회
    activate DB
    DB-->>Backend: 사용자 데이터
    deactivate DB
    Backend->>Backend: bcrypt로 비밀번호 검증
    Backend->>Backend: JWT 토큰 생성<br/>(HS-512, 1h)
    Backend-->>Client: 200 OK<br/>{ token }
    deactivate Backend
    
    Client->>Client: localStorage에 토큰 저장
    
    Client->>Backend: GET /api/todos<br/>Authorization: Bearer {token}
    activate Backend
    Backend->>Backend: authenticate 미들웨어<br/>토큰 검증
    Backend->>Backend: 페이로드에서 userId 추출
    Backend->>DB: 사용자의 할일 목록 조회
    activate DB
    DB-->>Backend: 할일 데이터
    deactivate DB
    Backend-->>Client: 200 OK<br/>[ todos... ]
    deactivate Backend
```

---

## 아키텍처 주요 특징

### Frontend
- **상태 관리**: Zustand (클라이언트 상태) + TanStack Query (서버 상태)
- **UI 프레임워크**: React 19 + Tailwind CSS (반응형)
- **API 통신**: axios 인스턴스 (요청 인터셉터에서 JWT 자동 추가)

### Backend
- **계층 분리**: Router → Middleware → Controller → Service → Repository
- **데이터 접근**: pg 라이브러리 + Parameterized Query (SQL Injection 방지)
- **에러 처리**: 중앙 에러 핸들러 + AppError 커스텀 클래스

### Database
- **DBMS**: PostgreSQL
- **인증 관계**: User 1:N Category, User 1:N Todo, Category 1:N Todo (선택)
- **보안**: 소유권 검증 (req.user.id 기준 필터링)

### 보안 정책
- **인증**: JWT HS-512 알고리즘, 1시간 만료
- **암호화**: bcrypt (salt rounds ≥ 12) 로 비밀번호 해시
- **SQL 보안**: 모든 쿼리에 파라미터 바인딩 ($1, $2, ...) 필수
- **토큰 저장**: localStorage (클라이언트에서 관리)

---

*본 문서는 프로젝트 구조 설계 원칙(docs/4-project-structure.md)을 기반으로 작성되었습니다.*
