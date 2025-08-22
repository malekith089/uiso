declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      school: string
      education_level: string
      identity_number: string
    }
  }

  interface User {
    role: string
    school: string
    education_level: string
    identity_number: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    school: string
    education_level: string
    identity_number: string
  }
}
