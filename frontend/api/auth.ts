import type { Wretch } from '@api';
import type { LoginFormData, SignupFormData } from '@features/Auth';
import type { User } from '@shared';

export const registerUser = (api: Wretch, data: SignupFormData) =>
  api.url('/auth/register').post(data).json();

export const loginUser = (api: Wretch, data: LoginFormData) =>
  api.url('/auth/login').post(data).json();

export const logoutUser = (api: Wretch) =>
  api.url('/auth/session').delete().json();

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
export const changePassword = (api: Wretch, data: ChangePasswordData) =>
  api.url('/auth/password').put(data).json<boolean>();

export const getUser = (api: Wretch) =>
  api.url('/auth/user').get().json<User>();

export type SetUserData = Pick<User, 'displayName'> & { avatar?: string };
export const setUser = (api: Wretch, data: SetUserData) =>
  api.url('/auth/user').put(data).json<User>();
