import type { NextAuthConfig } from "next-auth"

const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
      const isOnAdmin = nextUrl.pathname.startsWith("/admin")
      const isOnAuth =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register") ||
        nextUrl.pathname.startsWith("/forgot-password")

      // Allow access to public routes
      if (nextUrl.pathname === "/" || isOnAuth) {
        return true
      }

      // Redirect to login if accessing protected routes without authentication
      if ((isOnDashboard || isOnAdmin) && !isLoggedIn) {
        return false // Redirect to /login
      }

      // Check admin access
      if (isOnAdmin && auth?.user?.role !== "admin") {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }

      return true
    },
  },
  providers: [], // Add providers with an empty array for now
}

export { authConfig }
export default authConfig
