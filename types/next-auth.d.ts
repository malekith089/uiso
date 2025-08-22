import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      school: string;
      education_level: string;
      identity_number: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    school: string;
    education_level: string;
    identity_number: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: string;
    school: string;
    education_level: string;
    identity_number: string;
  }
}