import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

import type { Profile, ProfileDetails } from "@/utils/types";

export interface JWTToken {
  id?: string;
  name?: string;
  email?: string;
  picture_url?: string;
  username?: string;
  provider?: string;
  provider_id?: string;
  [key: string]: any; // permitir campos extras
}

export interface SessionWithUser {
  user: JWTToken;
  expires: string;
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Imlinkedy",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Aqui você chama seu backend ou DB para validar usuário
        const user: Profile = await fetch(
          `${process.env.API_URL}/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          }
        ).then(res => res.json());

        if (user?.id) return user;
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token = {
          ...token,
          id: user.id,
          name: user.full_name ?? user.first_name ?? user.username,
          email: user.email,
          username: user.username,
          picture_url: user.avatar_url,
          provider: account?.provider,
          provider_id: user.provider_id,
        };
      }

      // permitimos dados adicionais de profile
      if (profile) {
        token = { ...token, ...profile };
      }

      return token as JWTToken;
    },

    async session({ session, token }) {
      session.user = token as JWTToken;
      return session as SessionWithUser;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };