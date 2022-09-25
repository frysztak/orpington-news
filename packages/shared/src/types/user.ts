export interface User {
  username: string;
  displayName: string;
  avatarUrl?: string;
}
export const placeholderUser: User = {
  displayName: '',
  username: '',
};
