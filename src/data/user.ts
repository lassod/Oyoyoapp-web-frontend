import { db } from '@/lib/db';
import { User } from 'next-auth';

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.users.findUnique({
      where: { email },
    });

    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await db.users.findUnique({
      where: { id: +id },
    });
    return user;
  } catch {
    return null;
  }
};
