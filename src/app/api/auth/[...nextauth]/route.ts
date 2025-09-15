import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import type { AuthOptions } from "next-auth";
import type { User } from "@/types/types"; // <-- substituído Profile por User

// Extensão do JWT para incluir campos opcionais
export interface JWTToken {
  id: string;
  email?: string;
  name?: string;
  username?: string;
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
  nationality?: string;
  terms_and_policies?: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;
  [key: string]: unknown;
}

// Extensão da session para incluir o usuário tipado
export interface SessionWithUser {
  user: JWTToken;
  expires: string;
}

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }),
    FacebookProvider({ clientId: process.env.FACEBOOK_CLIENT_ID!, clientSecret: process.env.FACEBOOK_CLIENT_SECRET! }),
 
    GithubProvider({ clientId: process.env.GITHUB_ID,clientSecret: process.env.GITHUB_SECRET,}),
    CredentialsProvider({
      id: "imlinkedy",
      name: "Imlinkedy",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const user: User = {
          id: "custom-id",
          email: credentials.email,
        };

        return user;
      },
    }),
  ],
  session: { strategy: "jwt" },
  jwt: { secret: process.env.JWT_SECRET! },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as User;
        token = { ...token, ...u };
      }
      return token as JWTToken;
    },
    async session({ session, token }) {
      session.user = token as JWTToken;
      return session as SessionWithUser;
    },
  },
  pages: { signIn: "/auth/signin", signOut: "/auth/signout", error: "/auth/error" },
  debug: process.env.NODE_ENV === "development",
};

// Apenas exportar o handler para App Router
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };