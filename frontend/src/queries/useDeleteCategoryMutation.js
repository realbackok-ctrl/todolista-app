import { useMutation, useQueryClient } from '@tanstack/react-query';
import categoryApi from '../api/categoryApi';
import { QUERY_KEYS } from '../constants/queryKeys';

/**
 * 카테고리 삭제 뮤테이션 훅.
 * 성공 시 CATEGORIES와 TODOS 모두 invalidate한다.
 * 카테고리 삭제 시 연결된 할일의 categoryId가 null로 변경되므로
 * 할일 목록도 함께 갱신해야 한다. (BR-CAT-02)
 *
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TODOS });
    },
  });
}

export default useDeleteCategoryMutation;
