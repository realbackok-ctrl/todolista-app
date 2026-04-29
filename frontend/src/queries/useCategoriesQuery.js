import { useQuery } from '@tanstack/react-query';
import categoryApi from '../api/categoryApi';
import { QUERY_KEYS } from '../constants/queryKeys';

/**
 * 카테고리 목록을 조회하는 쿼리 훅.
 *
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
function useCategoriesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: categoryApi.getCategories,
  });
}

export default useCategoriesQuery;
