import { useMutation } from '@tanstack/react-query';
import authApi from '../api/authApi';

function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (data) => authApi.changePassword(data),
  });
}

export default useChangePasswordMutation;
