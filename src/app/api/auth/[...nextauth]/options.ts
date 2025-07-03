import type { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axiosInstance from "@/lib/axios-instance";
import { setCookie } from "nookies";
import { getOrCreateStripeSession } from "@/lib/stripe-session";

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    role: string;
    accountType: string;
    accessTokenExpires: number;
    stripeConnectId?: string | null;
    error?: string;
  }
}

declare module "next-auth" {
  interface User {
    jwt: string;
    refreshToken: string;
    role: string;
    accountType: string;
    paymentGateway?: any;
    stripeConnectId?: string | null;
  }
  interface Session {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: string;
    stripeSecret?: string | null | undefined;
    stripeConnectId?: string | null;
    user: { role: string; accountType: string; id: number } & DefaultSession["user"];
  }
}

export const options: NextAuthOptions = {
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        jwt: { label: "Jwt", type: "text" },
        refreshToken: { label: "RefreshToken", type: "text" },
        role: { label: "Role", type: "text" },
        id: { label: "Id", type: "text" },
        stripeConnectId: { label: "StripeConnectId", type: "text" },
      },
      async authorize(credentials: any) {
        if (!credentials) return null;
        console.log(credentials);
        try {
          if (credentials) {
            setCookie(null, "refreshToken", credentials.refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              path: "/",
              maxAge: 7 * 24 * 60 * 60,
            });
            return {
              ...credentials,
              stripeConnectId:
                credentials.stripeConnectId &&
                credentials.stripeConnectId !== "null" &&
                credentials.stripeConnectId.trim() !== ""
                  ? credentials.stripeConnectId
                  : null,
            };
          }
          return null;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("ASdasdasdasd", token);
      console.log("ASdasdasdasd", user);

      if (!token.sub) return token;
      if (user) {
        token.accessToken = user.jwt;
        token.refreshToken = user.refreshToken;
        token.role = user.role;
        token.accountType = user.accountType;
        token.stripeConnectId =
          user.stripeConnectId && user.stripeConnectId !== "null"
            ? user.stripeConnectId // keep a real ID
            : null;
        token.accessTokenExpires = Date.now() + 3600 * 1000; // 1 hour
      }
      token.error = token.error;
      if (Date.now() < token.accessTokenExpires) return token;
      return refreshAccessToken(token);
    },
    async session({ token, session }) {
      session.accessToken = token.accessToken;
      session.user.role = token.role;
      session.refreshToken = token.refreshToken;
      session.accessTokenExpires = token.accessTokenExpires;
      session.stripeConnectId = token.stripeConnectId;
      session.user.accountType = token.accountType;
      session.error = token.error;
      if (token.sub && session.user) session.user.id = parseInt(token.sub);
      if (token?.stripeConnectId)
        session.stripeSecret = await getOrCreateStripeSession(token.stripeConnectId as string);

      return session;
    },
  },
};

async function refreshAccessToken(token: any) {
  try {
    const response = await axiosInstance.post(`/auth/refresh-token/${token.refreshToken}`);

    const refreshedTokens = response?.data?.data || response.data;
    console.log(refreshedTokens);
    return {
      ...token,
      accessToken: refreshedTokens?.access_token || refreshedTokens?.jwt,
      accessTokenExpires: Date.now() + parseInt(refreshedTokens.expires_in) * 1000, // 1 hour
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Failed to refresh access token", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
