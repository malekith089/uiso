// lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Cache untuk menyimpan session valid
const sessionCache = new Map<string, { user: any; expires: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 menit

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const url = request.nextUrl.clone()
  const pathname = request.nextUrl.pathname
  
  // Definisikan route types
  const isProtectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard")
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/auth")

  // Skip untuk route public
  if (!isProtectedRoute && !isAuthRoute) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Cek session dari cookie untuk caching
  const sessionCookie = request.cookies.get('sb-auth-token')
  const cacheKey = sessionCookie?.value || 'no-session'
  
  // Cek cache terlebih dahulu
  const cached = sessionCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    const user = cached.user
    
    if (isProtectedRoute && !user) {
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }
    
    if (isAuthRoute && user) {
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
    
    return supabaseResponse
  }

  // Jika tidak ada di cache, fetch dari Supabase
  const { data: { user } } = await supabase.auth.getUser()
  
  // Simpan ke cache
  if (cacheKey !== 'no-session') {
    sessionCache.set(cacheKey, {
      user,
      expires: Date.now() + CACHE_DURATION
    })
  }
  
  // Bersihkan cache yang expired
  if (sessionCache.size > 100) {
    const now = Date.now()
    for (const [key, value] of sessionCache.entries()) {
      if (value.expires < now) {
        sessionCache.delete(key)
      }
    }
  }

  if (isProtectedRoute && !user) {
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && user) {
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}