import { useQuery } from '@tanstack/react-query';
import todoApi from '../api/todoApi';
import { QUERY_KEYS } from '../constants/queryKeys';

/**
 * 할일 단건을 조회하는 쿼리 훅.
 * id가 존재할 때만 fetch한다.
 *
 * @param {number|string|null|undefined} id - 할일 ID
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
function useTodoQuery(id) {
  return useQuery({
    queryKey: QUERY_KEYS.TODO(id),
    queryFn: () => todoApi.getTodo(id),
    enabled: !!id,
  });
}

export default useTodoQuery;
