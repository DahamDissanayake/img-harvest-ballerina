import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import PostgresAdapter from "@auth/pg-adapter";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const handler = NextAuth({
  adapter: PostgresAdapter(pool) as any, // Cast to any to avoid type mismatch with next-auth v4 and @auth/pg-adapter
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // Attach the database user ID to the session object
        session.user.id = user.id;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
