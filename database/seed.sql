-- =============================================================
-- TodoList Application Seed Data
-- 작성일: 2026-04-28
-- 사용법: psql -d todolista_dev -f database/seed.sql
-- =============================================================

-- 기존 데이터 삭제 (멱등성)
TRUNCATE users, categories, todos CASCADE;

-- -------------------------------------------------------------
-- Users (테스트 사용자)
-- 비밀번호: 모두 "password123" 의 bcrypt 해시값
-- $2b$12$LQv3c1yqBWVHxkd0PHA.QCO4YZ5MO9N9Pb9X2xJyE5dCrS8WQdMW6y
-- -------------------------------------------------------------
INSERT INTO users (email, password) VALUES 
  ('user1@test.com', '$2b$12$LQv3c1yqBWVHxkd0PHA.QCO4YZ5MO9N9Pb9X2xJyE5dCrS8WQdMW6y'),
  ('user2@test.com', '$2b$12$LQv3c1yqBWVHxkd0PHA.QCO4YZ5MO9N9Pb9X2xJyE5dCrS8WQdMW6y');

-- -------------------------------------------------------------
-- Categories (각 사용자별 2개씩)
-- -------------------------------------------------------------
INSERT INTO categories (user_id, name) 
SELECT id, name FROM (
  VALUES ((SELECT id FROM users WHERE email = 'user1@test.com'), 'WORK'),
         ((SELECT id FROM users WHERE email = 'user1@test.com'), 'PERSONAL'),
         ((SELECT id FROM users WHERE email = 'user2@test.com'), 'STUDY'),
         ((SELECT id FROM users WHERE email = 'user2@test.com'), 'HOBBY')
) AS v(user_id, name);

-- -------------------------------------------------------------
-- Todos (총 10건, 다양한 status와 due_date 포함)
-- -------------------------------------------------------------
INSERT INTO todos (user_id, category_id, title, description, status, due_date, created_at, updated_at, completed_at) 
SELECT 
  user_id,
  category_id,
  title,
  description,
  status,
  due_date,
  created_at,
  updated_at,
 CASE WHEN status = 'COMPLETED' THEN updated_at ELSE NULL END
FROM (
  -- user1 - WORK
  VALUES 
    ('66927b96-c7d8-41f4-ba64-2205928ad20b', 'c6ae7107-7ecd-4f59-83ea-0b0b2a8f9498', '프로젝트 기획', '프로젝트 세부사항 기획', 'PENDING', '2026-05-01 10:00:00', NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days'),
    ('66927b96-c7d8-41f4-ba64-2205928ad20b', 'c6ae7107-7ecd-4f59-83ea-0b0b2a8f9498', '보고서 작성', '월간 보고서 작성', 'COMPLETED', '2026-04-25 18:00:00', NOW() - INTERVAL '5 days', NOW(), NOW()),
    ('66927b96-c7d8-41f4-ba64-2205928ad20b', 'c6ae7107-7ecd-4f59-83ea-0b0b2a8f9498', '회의 준비', '주간 회의 자료 준비', 'PENDING', '2026-04-30 14:00:00', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
    -- user1 - PERSONAL
    ('66927b96-c7d8-41f4-ba64-2205928ad20b', 'd46ca3c2-172a-42b5-8092-a9f973953898', '운동하기', '주 3회 운동', 'PENDING', '2026-04-29 08:00:00', NOW() - INTERVAL '7 days', NOW() - INTERVAL '1 day'),
    ('66927b96-c7d8-41f4-ba64-2205928ad20b', 'd46ca3c2-172a-42b5-8092-a9f973953898', '책 읽기', '이번 달 독서', 'PENDING', '2026-04-27 22:00:00', NOW() - INTERVAL '14 days', NOW() - INTERVAL '10 days'),
    -- user2 - STUDY
    ('424e9085-9736-4912-a2e3-e5aaaa6ffe38', 'b0a76dab-755f-4a2a-a6a3-43197731185b', '수업 복습', '수학 복습', 'PENDING', '2026-05-05 09:00:00', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
    ('424e9085-9736-4912-a2e3-e5aaaa6ffe38', 'b0a76dab-755f-4a2a-a6a3-43197731185b', '과제 제출', '프로그래밍 과제', 'COMPLETED', '2026-04-26 23:59:00', NOW() - INTERVAL '1 day', NOW(), NOW()),
    -- user2 - HOBBY
    ('424e9085-9736-4912-a2e3-e5aaaa6ffe38', 'c14c8485-ad03-4069-be62-b70e7d631012', '프로젝트 만들기', '개인 프로젝트', 'PENDING', '2026-05-10 18:00:00', NOW() - INTERVAL '8 days', NOW() - INTERVAL '5 days'),
    ('424e9085-9736-4912-a2e3-e5aaaa6ffe38', 'c14c8485-ad03-4069-be62-b70e7d631012', '게임하기', '주말 게임', 'PENDING', '2026-05-03 20:00:00', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
    -- user2 - NO CATEGORY
    ('424e9085-9736-4912-a2e3-e5aaaa6ffe38', NULL, '카테고리 없는 할일', '카테고리 없는 할일', 'PENDING', '2026-05-02 12:00:00', NOW() - INTERVAL '6 days', NOW() - INTERVAL '4 days')
) AS t(user_id, category_id, title, description, status, due_date, created_at, updated_at);

-- -------------------------------------------------------------
-- 검증 쿼리
-- -------------------------------------------------------------
SELECT 'users' AS table_name, COUNT(*) AS count FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'todos', COUNT(*) FROM todos;