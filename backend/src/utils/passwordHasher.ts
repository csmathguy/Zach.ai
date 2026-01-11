import bcrypt from 'bcrypt';

const DEFAULT_SALT_ROUNDS = 12;

const getSaltRounds = (): number => {
  const value = Number(process.env.BCRYPT_SALT_ROUNDS);
  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_SALT_ROUNDS;
  }
  return Math.floor(value);
};

export const hashPassword = async (password: string): Promise<string> =>
  bcrypt.hash(password, getSaltRounds());

export const verifyPassword = async (password: string, hash: string): Promise<boolean> =>
  bcrypt.compare(password, hash);
