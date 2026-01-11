export interface PasswordResetToken {
  id: string;
  userId: string;
  createdByUserId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt: Date;
}
