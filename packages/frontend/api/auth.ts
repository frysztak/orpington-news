import type { Wretcher } from 'wretch';
import type { LoginFormData, SignupFormData } from '@features/Auth';
import type { User } from '@orpington-news/shared';

export const registerUser = (api: Wretcher, data: SignupFormData) =>
  api.url('/auth/register').post(data).json();

export const loginUser = (api: Wretcher, data: LoginFormData) =>
  api.url('/auth/login').post(data).json();

export const logoutUser = (api: Wretcher) =>
  api.url('/auth/session').delete().json();

export const changePassword = (
  api: Wretcher,
  data: { currentPassword: string; newPassword: string }
) => api.url('/auth/password').put(data).json<boolean>();

export const getUser = (api: Wretcher) =>
  api.url('/auth/user').get().json<User>();

export type SetUserData = Pick<User, 'displayName' | 'avatar'>;
export const setUser = (api: Wretcher, data: SetUserData) =>
  api.url('/auth/user').put(data).json<User>();
