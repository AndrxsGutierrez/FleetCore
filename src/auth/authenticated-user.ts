import type { UserRole } from './entities/user.entity.js';

export interface AuthenticatedUser {
  sub: number;
  email: string;
  role: UserRole;
  mechanicId: number | null;
}
