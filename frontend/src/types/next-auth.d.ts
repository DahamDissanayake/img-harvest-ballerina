import NextAuth, { DefaultSession } from "next-auth";

// Module augmentation to add `id` to the session user object
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
