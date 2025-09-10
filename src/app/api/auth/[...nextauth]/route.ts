// /app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

interface Profile {
  id: string;
  username: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  bi_passport?: string;
  nationality?: string;
  country?: string;
  state_province?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  house_apartment?: string;
  postal_code?: string;
  language?: string;
  currency?: string;
  social_links?: string[];
  website?: string;
  work_local?: string;
  occupation?: string;
  company?: string;
  education?: string;
  skills?: string[];
  interests?: string[];
}


const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    {
      id: "imlinkedy",
      name: "Imlinkedy",
      type: "oauth",
      version: "1.0",
      clientId: process.env.IMLINKEDY_CLIENT_ID!,
      clientSecret: process.env.IMLINKEDY_CLIENT_SECRET!,
      authorization: {
        url: "https://imlinked.vercel.app/oauth/authorize",
        params: { scope: "email profile" },
      },
      token: "https://imlinked.vercel.app/oauth/token",
      userinfo: "https://imlinked.vercel.app/oauth/me",
      profile(profile: Profile) {
        return {
          id: profile.id || profile.username,
          name: profile.full_name || profile.username,
          email: profile.email,
          image: profile.avatar_url || null,
          userDetails: {
            phone: profile.phone,
            birth_date: profile.birth_date,
            gender: profile.gender,
            bi_passport: profile.bi_passport,
            nationality: profile.nationality,
            country: profile.country,
            state_province: profile.state_province,
            city: profile.city,
            neighborhood: profile.neighborhood,
            street: profile.street,
            house_apartment: profile.house_apartment,
            postal_code: profile.postal_code,
            language: profile.language,
            currency: profile.currency,
            social_links: profile.social_links,
            website: profile.website,
            work_local: profile.work_local,
            occupation: profile.occupation,
            company: profile.company,
            education: profile.education,
            skills: profile.skills,
            interests: profile.interests,
          },
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) token.accessToken = account.access_token;
      if (user?.userDetails) token.userDetails = user.userDetails;
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      if (token.userDetails) session.userDetails = token.userDetails;
      return session;
    },
  },
});

export { handler as GET, handler as POST };