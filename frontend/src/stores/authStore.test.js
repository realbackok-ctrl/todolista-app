import { describe, it, expect, beforeEach } from 'vitest';
import useAuthStore from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    // 각 테스트 시작 전 상태 초기화
    useAuthStore.getState().clearAuth();
  });

  it('초기 상태는 token과 user가 null이어야 한다', () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('setAuth를 호출하면 token과 user가 저장되어야 한다', () => {
    const mockToken = 'test-token';
    const mockUser = { id: 1, email: 'test@example.com' };

    useAuthStore.getState().setAuth(mockToken, mockUser);

    const state = useAuthStore.getState();
    expect(state.token).toBe(mockToken);
    expect(state.user).toEqual(mockUser);
  });

  it('clearAuth를 호출하면 token과 user가 초기화되어야 한다', () => {
    useAuthStore.getState().setAuth('token', { id: 1 });
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });
});
