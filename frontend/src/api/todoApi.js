import apiClient from './client';

/**
 * 할일(Todo) 관련 API 함수 모음
 */
const todoApi = {
  /**
   * 할일 목록 조회
   * @param {{ status?: string, categoryId?: number }} params - 필터 파라미터
   * @returns {Promise<Object[]>}
   */
  getTodos: (params) => apiClient.get('/todos', { params }).then((res) => res.data),

  /**
   * 할일 생성
   * @param {{ title: string, description?: string, categoryId?: number, dueDate?: string }} data
   * @returns {Promise<Object>}
   */
  createTodo: (data) => apiClient.post('/todos', data).then((res) => res.data),

  /**
   * 할일 상세 조회
   * @param {number} id - 할일 ID
   * @returns {Promise<Object>}
   */
  getTodo: (id) => apiClient.get(`/todos/${id}`).then((res) => res.data),

  /**
   * 할일 수정
   * @param {number} id - 할일 ID
   * @param {{ title: string, description?: string, categoryId?: number, dueDate?: string }} data
   * @returns {Promise<Object>}
   */
  updateTodo: (id, data) => apiClient.put(`/todos/${id}`, data).then((res) => res.data),

  /**
   * 할일 상태 변경
   * @param {number} id - 할일 ID
   * @param {{ status: 'PENDING' | 'COMPLETED' }} data
   * @returns {Promise<Object>}
   */
  toggleTodoStatus: (id, data) =>
    apiClient.patch(`/todos/${id}/status`, data).then((res) => res.data),

  /**
   * 할일 삭제
   * @param {number} id - 할일 ID
   * @returns {Promise<void>}
   */
  deleteTodo: (id) => apiClient.delete(`/todos/${id}`).then((res) => res.data),
};

export default todoApi;
