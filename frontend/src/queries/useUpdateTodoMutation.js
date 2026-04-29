import { useMutation, useQueryClient } from '@tanstack/react-query';
import todoApi from '../api/todoApi';
import { QUERY_KEYS } from '../constants/queryKeys';

/**
 * 할일 수정 뮤테이션 훅.
 * 성공 시 TODOS 목록과 해당 TODO 단건 캐시를 invalidate한다.
 *
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
function useUpdateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => todoApi.updateTodo(id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TODOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TODO(id) });
    },
  });
}

export default useUpdateTodoMutation;
