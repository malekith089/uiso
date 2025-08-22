import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Wrap the auth function to ensure proper middleware behavior
export default auth((req: NextRequest & { auth: any }) => {
  // The auth function automatically handles authentication
  // You can add additional logic here if needed
  return NextResponse.next();
});

// The matcher configures the middleware to run on all paths except for
// specific ones like API routes, static files, and images.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};