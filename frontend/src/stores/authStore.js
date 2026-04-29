import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 인증 전역 상태 스토어
 * @typedef {Object} AuthState
 * @property {string|null} token - JWT 액세스 토큰
 * @property {Object|null} user - 로그인 사용자 정보
 * @property {function} setAuth - 토큰과 사용자 정보 저장
 * @property {function} clearAuth - 토큰과 사용자 정보 초기화
 */
const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,

      /**
       * 로그인 성공 후 토큰과 사용자 정보를 저장한다.
       * @param {string} token - JWT 액세스 토큰
       * @param {Object} user - 사용자 정보 객체
       */
      setAuth: (token, user) => set({ token, user }),

      /**
       * 로그아웃 또는 401 응답 시 인증 상태를 초기화한다.
       */
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

export default useAuthStore;
