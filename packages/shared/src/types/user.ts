import { ID } from './id';

export interface User {
  username: string;
  displayName: string;
  avatarUrl?: string;
  homeId: ID;
}
export const placeholderUser: User = {
  displayName: '',
  username: '',
  homeId: 0,
};
