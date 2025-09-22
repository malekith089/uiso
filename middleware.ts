// middleware.ts
import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // HANYA jalankan middleware untuk route yang benar-benar perlu
  const pathname = request.nextUrl.pathname
  
  // Skip middleware untuk static assets dan API routes yang tidak perlu auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/public') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // Skip untuk file statis (.css, .js, .png, dll)
  ) {
    return
  }
  
  return await updateSession(request)
}

// PENTING: Batasi middleware hanya untuk route yang memerlukan auth
export const config = {
  matcher: [
    // Auth routes
    '/login',
    '/register',
    '/auth/:path*',
    // Protected routes
    '/admin/:path*',
    '/dashboard/:path*',
    // API routes yang perlu auth
    '/api/user/:path*',
    '/api/admin/:path*',
    // EXCLUDE static files and public routes
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}