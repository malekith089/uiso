// middleware.ts
import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

// Middleware hanya jalan untuk route yang perlu proteksi
export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
  ],
}
