/**
 * TanStack Query 쿼리 키 중앙 관리
 * 쿼리 키를 상수로 관리하여 오타 방지 및 일관성 유지
 */
export const QUERY_KEYS = {
  TODOS: ['todos'],
  TODO: (id) => ['todos', id],
  CATEGORIES: ['categories'],
};
