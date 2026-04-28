-- =============================================================
-- TodoList Application Database Schema
-- 참조: docs/6-erd.md v1.0
-- 작성일: 2026-04-28
-- DB: PostgreSQL
-- =============================================================

-- -------------------------------------------------------------
-- 초기화: 기존 테이블 삭제 (의존성 역순)
-- -------------------------------------------------------------
DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS todo_status;

-- -------------------------------------------------------------
-- ENUM 타입 정의
-- -------------------------------------------------------------
CREATE TYPE todo_status AS ENUM ('PENDING', 'COMPLETED');

-- -------------------------------------------------------------
-- 1. users 테이블
-- -------------------------------------------------------------
CREATE TABLE users (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 2. categories 테이블
-- 삭제 정책: userId → ON DELETE CASCADE (사용자 삭제 시 카테고리 함께 삭제)
-- 복합 UNIQUE: 동일 사용자 내 카테고리명 중복 불가
-- -------------------------------------------------------------
CREATE TABLE categories (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100)    NOT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_categories_user_name UNIQUE (user_id, name)
);

-- -------------------------------------------------------------
-- 3. todos 테이블
-- 삭제 정책:
--   user_id    → ON DELETE CASCADE  (사용자 삭제 시 할일 함께 삭제)
--   category_id → ON DELETE SET NULL (카테고리 삭제 시 할일 유지, categoryId = NULL)
-- -------------------------------------------------------------
CREATE TABLE todos (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     UUID            REFERENCES categories(id) ON DELETE SET NULL,
    title           VARCHAR(255)    NOT NULL,
    description     TEXT,
    status          todo_status     NOT NULL DEFAULT 'PENDING',
    due_date        TIMESTAMP,
    completed_at    TIMESTAMP,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 인덱스
-- -------------------------------------------------------------
CREATE INDEX idx_categories_user_id   ON categories(user_id);

CREATE INDEX idx_todos_user_id        ON todos(user_id);
CREATE INDEX idx_todos_category_id    ON todos(category_id);
CREATE INDEX idx_todos_status         ON todos(status);
CREATE INDEX idx_todos_due_date       ON todos(due_date);
