export type AuthRole = 'USER' | 'ADMIN';

export interface AuthUser {
  id: string;
  username: string;
  role: AuthRole;
}
