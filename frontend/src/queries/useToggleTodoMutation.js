import { useMutation, useQueryClient } from '@tanstack/react-query';
import todoApi from '../api/todoApi';
import { QUERY_KEYS } from '../constants/queryKeys';

/**
 * 할일 상태 토글 뮤테이션 훅.
 * mutationFn에 { id, status } 형태로 전달하며, 토글 방향('PENDING' ↔ 'COMPLETED')은 호출 측에서 결정한다.
 * 성공 시 TODOS 목록과 해당 TODO 단건 캐시를 invalidate한다.
 *
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
function useToggleTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => todoApi.toggleTodoStatus(id, { status }),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TODOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TODO(id) });
    },
  });
}

export default useToggleTodoMutation;
