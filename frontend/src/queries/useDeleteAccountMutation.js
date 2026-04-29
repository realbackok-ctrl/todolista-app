import { useMutation } from '@tanstack/react-query';
import authApi from '../api/authApi';

function useDeleteAccountMutation() {
  return useMutation({
    mutationFn: () => authApi.deleteAccount(),
  });
}

export default useDeleteAccountMutation;
