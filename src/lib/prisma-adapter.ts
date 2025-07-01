//@ts-nocheck
import type { PrismaClient, Prisma } from '@repo/prisma';
import type {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
} from '@auth/core/adapters';

/**
 * We need to create our own mapped PrismaAdapter  to work with Next Auth (Authjs)
 * since the User model is named Users instead of User as Recommended
 * Reference: https://github.com/nextauthjs/next-auth/blob/main/packages/adapter-prisma/src/index.ts
 */
export function PrismaAdapter(
  prisma: PrismaClient | ReturnType<PrismaClient['$extends']>
): Adapter {
  const p = prisma as PrismaClient;
  return {
    createUser: ({ id: _id, ...data }) => {
      return p.users.create({ data });
    },
    getUser: (id) => p.users.findUnique({ where: { id: +id } }),
    getUserByEmail: (email) => p.users.findUnique({ where: { email } }),
    async getUserByAccount(provider_providerAccountId) {
      const account = await p.account.findUnique({
        where: { provider_providerAccountId },
        select: { user: true },
      });
      return (account?.user as AdapterUser) ?? null;
    },
    updateUser: ({ id, ...data }) =>
      p.users.update({ where: { id }, data }) as Promise<AdapterUser>,
    deleteUser: (id) =>
      p.users.delete({ where: { id: +id } }) as Promise<AdapterUser>,
    linkAccount: (data) =>
      p.account.create({ data }) as unknown as AdapterAccount,
    unlinkAccount: (provider_providerAccountId) =>
      p.account.delete({
        where: { provider_providerAccountId },
      }) as unknown as AdapterAccount,
    async getSessionAndUser(sessionToken) {
      const userAndSession = await p.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!userAndSession) return null;
      const { user, ...session } = userAndSession;
      return { user, session } as {
        user: AdapterUser;
        session: AdapterSession;
      };
    },
    createSession: (data) => {
      console.log('CREATE SESSION', data);
      return p.session.create({
        data: {
          sessionToken: data.sessionToken,
          userId: +data.userId,
          expires: data.expires,
        },
      });
    },
    updateSession: (data) =>
      p.session.update({ where: { sessionToken: data.sessionToken }, data }),
    deleteSession: (sessionToken) =>
      p.session.delete({ where: { sessionToken } }),
    async createVerificationToken(data) {
      const verificationToken = await p.verificationToken.create({ data });
      // @ts-expect-errors // MongoDB needs an ID, but we don't
      if (verificationToken.id) delete verificationToken.id;
      return verificationToken;
    },
    async useVerificationToken(identifier_token) {
      try {
        const verificationToken = await p.verificationToken.delete({
          where: { identifier_token },
        });
        // @ts-expect-errors // MongoDB needs an ID, but we don't
        if (verificationToken.id) delete verificationToken.id;
        return verificationToken;
      } catch (error) {
        // If token already used/deleted, just return null
        // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
        if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025')
          return null;
        throw error;
      }
    },
    async getAccount(providerAccountId, provider) {
      return p.account.findFirst({
        where: { providerAccountId, provider },
      }) as Promise<AdapterAccount | null>;
    },
    async createAuthenticator(authenticator) {
      return p.authenticator.create({
        data: authenticator,
      });
    },
    async getAuthenticator(credentialID) {
      return p.authenticator.findUnique({
        where: { credentialID },
      });
    },
    async listAuthenticatorsByUserId(userId) {
      return p.authenticator.findMany({
        where: { userId: +userId },
      });
    },
    async updateAuthenticatorCounter(credentialID, counter) {
      return p.authenticator.update({
        where: { credentialID },
        data: { counter },
      });
    },
  };
}
