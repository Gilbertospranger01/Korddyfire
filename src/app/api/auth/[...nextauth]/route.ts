// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import type { AuthOptions } from "@auth/core/types";
import type { User } from "@types/types"; // seu type do Imlinkedy

const authOptions: AuthOptions = {
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
      id: "imlinkedy",
      name: "Imlinkedy",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const res = await fetch(`${process.env.BACKEND_URL}/api/auth/imlinkedy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        if (!res.ok) return null;

        const user: User = await res.json();
        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt", // ✅ SessionStrategy correto
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: User }) {
      if (user) token = { ...token, ...user };
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user = { ...token };
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };