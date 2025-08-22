import NextAuth from "next-auth";
import type { NextAuthConfig } from 'next-auth';
import Google from "next-auth/providers/google";
import { createSupabaseAdapter } from "@next-auth/supabase-adapter";

/**
 * This is the single source of truth for your NextAuth.js configuration.
 * By consolidating it here, we ensure that the middleware and API routes
 * use the exact same logic and prevent Edge runtime compatibility issues.
 */
const authOptions: NextAuthConfig = {
  // Specify custom pages to override the default NextAuth.js pages.
  pages: {
    signIn: '/login',
  },
  // Callbacks are asynchronous functions you can use to control what happens
  // when an action is performed.
  callbacks: {
    /**
     * The `authorized` callback is used to verify if a request is authorized.
     * It's called by the middleware.
     * @param {object} auth - The user's session object.
     * @param {object} request - The incoming request.
     * @returns {boolean | Response} - Return true to continue, false to redirect, or a Response object.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedPath = nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/admin');

      if (isProtectedPath) {
        if (isLoggedIn) return true; // Allow access if the user is logged in
        return false; // Redirect unauthenticated users to the login page
      } else if (isLoggedIn) {
        // If the user is logged in and tries to access public pages like login/register,
        // redirect them to the dashboard.
        const isPublicAuthPath = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');
        if (isPublicAuthPath) {
            return Response.redirect(new URL('/dashboard', nextUrl));
        }
      }
      // Allow all other requests by default
      return true;
    },
  },
  // Configure one or more authentication providers.
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  // The Supabase adapter allows you to use Supabase as your database for NextAuth.js.
  adapter: createSupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
};

// Export the handlers, auth, signIn, and signOut functions.
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
