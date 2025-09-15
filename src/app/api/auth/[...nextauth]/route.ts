// app/api/auth/[...nextauth]/route.ts
import NextAuth, { JWT } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

// Tipagem do usuário (retorno de qualquer provider ou backend)
export type User = {
  id: string;
  name?: string;
  username?: string;
  email?: string;
  picture_url?: string;
  full_name?: string;
  nickname?: string;
  phone?: string;
  birthdate?: string;
  gender?: string;
  slug?: string;
  provider_id?: string;
  provider?: string;
  provider_type?: string;
  phone_verified?: boolean;
  email_verified?: boolean;
  password?: string;
  nationality?: string;
  terms_and_policies?: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;
  [key: string]: unknown;
};

const options = {
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

  session: { strategy: "jwt" },
  jwt: { secret: process.env.JWT_SECRET },

  callbacks: {
    // JWT callback
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token = { ...token, ...user };
      }
      return token;
    },

    // Session callback
    async session({ session, token }: { session: any; token: JWT }) {
      session.user = { ...token };
      return session;
    },
  },
};

// Exportando apenas o handler para Next.js App Router
const handler = NextAuth(options);
export { handler as GET, handler as POST };