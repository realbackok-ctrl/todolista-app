import { useMutation, useQueryClient } from '@tanstack/react-query';
import todoApi from '../api/todoApi';
import { QUERY_KEYS } from '../constants/queryKeys';

/**
 * 할일 삭제 뮤테이션 훅.
 * 성공 시 TODOS 목록 전체를 invalidate하여 최신 데이터를 재요청한다.
 *
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
function useDeleteTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => todoApi.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TODOS });
    },
  });
}

export default useDeleteTodoMutation;
