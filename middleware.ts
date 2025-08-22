import { auth } from '@/lib/auth'; // Import the Edge-compatible auth function

// Use the imported auth function directly as the middleware.
// This avoids initializing NextAuth in the middleware and prevents the error.
export default auth;

// The matcher configures the middleware to run on all paths except for
// specific ones like API routes, static files, and images.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
