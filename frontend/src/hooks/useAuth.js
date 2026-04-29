import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';
import useAuthStore from '../stores/authStore';

/**
 * 로그인, 로그아웃, 회원가입 액션을 제공하는 커스텀 훅.
 * TanStack Query Mutation과 Zustand authStore를 조합한다.
 * React Router의 BrowserRouter 하위에서만 사용 가능하다.
 *
 * @returns {{
 *   loginMutation: import('@tanstack/react-query').UseMutationResult,
 *   registerMutation: import('@tanstack/react-query').UseMutationResult,
 *   logoutMutation: import('@tanstack/react-query').UseMutationResult,
 * }}
 */
function useAuth() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      navigate('/todos');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
      navigate('/login');
    },
    onError: () => {
      // 서버 오류가 발생해도 클라이언트 토큰은 폐기하고 로그인 페이지로 이동
      clearAuth();
      navigate('/login');
    },
  });

  return { loginMutation, registerMutation, logoutMutation };
}

export default useAuth;
