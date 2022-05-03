import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  changePassword,
  ChangePasswordData,
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  setUser,
  SetUserData,
  useApi,
  useHandleError,
} from '@api';
import { userKeys } from '@features/queryKeys';
import type { User } from '@orpington-news/shared';
import { LoginFormData, SignupFormData } from './types';

export const useSignup = () => {
  const { onError } = useHandleError();
  const api = useApi();

  return useMutation((data: SignupFormData) => registerUser(api, data), {
    onError,
  });
};

export const useLogin = () => {
  const { onError } = useHandleError();
  const api = useApi();

  return useMutation((data: LoginFormData) => loginUser(api, data), {
    onError,
  });
};

export const useLogout = () => {
  const { onError } = useHandleError();
  const api = useApi();

  return useMutation(() => logoutUser(api), {
    onError,
  });
};

export const useChangePassword = () => {
  const { onError } = useHandleError();
  const api = useApi();

  return useMutation((data: ChangePasswordData) => changePassword(api, data), {
    onError,
  });
};

export const useGetUser = () => {
  const { onError } = useHandleError();
  const api = useApi();

  return useQuery(userKeys.info, () => getUser(api), {
    onError,
    refetchOnMount: false,
  });
};

export const useSetUser = () => {
  const { onError } = useHandleError();
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation((data: SetUserData) => setUser(api, data), {
    onError,
    onSuccess: (data: User) => {
      queryClient.setQueryData(userKeys.info, data);
    },
  });
};
