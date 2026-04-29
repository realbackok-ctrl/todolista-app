import apiClient from './client';

/**
 * 인증 관련 API 함수 모음
 */
const authApi = {
  /**
   * 회원가입
   * @param {{ email: string, password: string }} data
   * @returns {Promise<{ user: Object }>}
   */
  register: (data) => apiClient.post('/auth/register', data).then((res) => res.data),

  /**
   * 로그인
   * @param {{ email: string, password: string }} data
   * @returns {Promise<{ token: string, user: Object }>}
   */
  login: (data) => apiClient.post('/auth/login', data).then((res) => res.data),

  /**
   * 로그아웃 (인증 필요)
   * @returns {Promise<void>}
   */
  logout: () => apiClient.post('/auth/logout').then((res) => res.data),

  /**
   * 회원 탈퇴 (인증 필요)
   * @returns {Promise<void>}
   */
  deleteAccount: () => apiClient.delete('/auth/account').then((res) => res.data),

  /**
   * 비밀번호 변경 (인증 필요)
   * @param {{ currentPassword: string, newPassword: string }} data
   * @returns {Promise<void>}
   */
  changePassword: (data) => apiClient.patch('/auth/password', data).then((res) => res.data),
};

export default authApi;
