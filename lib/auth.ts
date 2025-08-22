import NextAuth from "next-auth";
import type { NextAuthConfig } from 'next-auth';
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@/lib/supabase/server";

/**
 * NextAuth.js configuration for email/password authentication only
 */
const authOptions: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  
  callbacks: {
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const isLoggedIn = !!auth?.user;
      const isProtectedPath = nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/admin');

      if (isProtectedPath) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      } else if (isLoggedIn) {
        // Redirect logged-in users away from auth pages
        const isPublicAuthPath = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');
        if (isPublicAuthPath) {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
      }
      return true;
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string || 'user';
        session.user.school = token.school as string || '';
        session.user.education_level = token.education_level as string || '';
        session.user.identity_number = token.identity_number as string || '';
      }
      return session;
    },
    
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.school = user.school;
        token.education_level = user.education_level;
        token.identity_number = user.identity_number;
      }
      return token;
    }
  },
  
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const supabase = await createClient();
          
          // Sign in with Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          if (authError || !authData.user) {
            console.error('Auth error:', authError);
            return null;
          }

          // Get additional user data from your custom table (if you have one)
          // If you store additional user info in a separate table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          // If you don't have a profiles table, you can use the auth user data directly
          if (profileError) {
            console.log('No profile found, using auth data only');
            return {
              id: authData.user.id,
              email: authData.user.email!,
              name: authData.user.user_metadata?.full_name || authData.user.email!,
              role: 'user',
              school: '',
              education_level: '',
              identity_number: '',
            };
          }

          return {
            id: authData.user.id,
            email: authData.user.email!,
            name: profile?.full_name || authData.user.email!,
            role: profile?.role || 'user',
            school: profile?.school_institution || '',
            education_level: profile?.education_level || '',
            identity_number: profile?.identity_number || '',
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      }
    })
  ],
  
  session: {
    strategy: "jwt",
  },
  
  // Remove adapter if you want to rely purely on Supabase Auth without NextAuth database
  // adapter: undefined,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);