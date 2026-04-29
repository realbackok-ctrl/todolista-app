import { useQuery } from '@tanstack/react-query';
import todoApi from '../api/todoApi';
import { QUERY_KEYS } from '../constants/queryKeys';

/**
 * 할일 목록을 조회하는 쿼리 훅.
 * status, categoryId 필터를 queryKey에 포함하여 필터 변경 시 자동 재요청된다.
 *
 * @param {{ status?: string, categoryId?: string|number }} [params]
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
function useTodosQuery({ status, categoryId } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.TODOS, { status, categoryId }],
    queryFn: () => todoApi.getTodos({ status, categoryId }),
  });
}

export default useTodosQuery;
