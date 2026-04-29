import { useMutation, useQueryClient } from '@tanstack/react-query';
import categoryApi from '../api/categoryApi';
import { QUERY_KEYS } from '../constants/queryKeys';

/**
 * 카테고리 생성 뮤테이션 훅.
 * 성공 시 CATEGORIES 목록을 invalidate하여 최신 데이터를 재요청한다.
 * 409 에러(중복 이름)는 별도 처리 없이 호출 측으로 전달된다.
 *
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => categoryApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
    },
  });
}

export default useCreateCategoryMutation;
