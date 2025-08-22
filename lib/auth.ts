import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Check user in Supabase database
          const { data: user, error } = await supabase.from("users").select("*").eq("email", credentials.email).single()

          if (error || !user) {
            return null
          }

          // In a real app, you'd verify the password hash here
          // For now, we'll use a simple comparison (replace with proper hashing)
          if (user.password !== credentials.password) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            role: user.role,
            school: user.school,
            education_level: user.education_level,
            identity_number: user.identity_number,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.school = user.school
        token.education_level = user.education_level
        token.identity_number = user.identity_number
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.school = token.school as string
        session.user.education_level = token.education_level as string
        session.user.identity_number = token.identity_number as string
      }
      return session
    },
  },
})
