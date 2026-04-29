import apiClient from './client';

/**
 * 카테고리 관련 API 함수 모음
 */
const categoryApi = {
  /**
   * 카테고리 목록 조회
   * @returns {Promise<Object[]>}
   */
  getCategories: () => apiClient.get('/categories').then((res) => res.data),

  /**
   * 카테고리 생성
   * @param {{ name: string }} data
   * @returns {Promise<Object>}
   */
  createCategory: (data) => apiClient.post('/categories', data).then((res) => res.data),

  /**
   * 카테고리 수정
   * @param {number} id - 카테고리 ID
   * @param {{ name: string }} data
   * @returns {Promise<Object>}
   */
  updateCategory: (id, data) =>
    apiClient.put(`/categories/${id}`, data).then((res) => res.data),

  /**
   * 카테고리 삭제
   * @param {number} id - 카테고리 ID
   * @returns {Promise<void>}
   */
  deleteCategory: (id) => apiClient.delete(`/categories/${id}`).then((res) => res.data),
};

export default categoryApi;
