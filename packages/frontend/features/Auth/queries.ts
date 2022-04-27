import { useApi, useHandleError } from '@api';
import { useMutation } from 'react-query';
import { LoginFormData, SignupFormData } from './types';

export const useSignup = () => {
  const { onError } = useHandleError();
  const api = useApi();

  return useMutation(
    (data: SignupFormData) => api.url('/auth/register').post(data).json(),
    {
      onError,
    }
  );
};

export const useLogin = () => {
  const { onError } = useHandleError();
  const api = useApi();

  return useMutation(
    (data: LoginFormData) => api.url('/auth/login').post(data).json(),
    {
      onError,
    }
  );
};

export const useLogout = () => {
  const { onError } = useHandleError();
  const api = useApi();

  return useMutation(() => api.url('/auth/session').delete().json(), {
    onError,
  });
};

export const useChangePassword = () => {
  const { onError } = useHandleError();
  const api = useApi();

  return useMutation(
    (password: string) =>
      api.url('/auth/password').put({ password }).json<boolean>(),
    {
      onError,
    }
  );
};
