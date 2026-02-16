import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname
      if (path.startsWith("/login") || path.startsWith("/api/auth")) {
        return true
      }
      return !!token
    },
  },
})

export const config = {
  matcher: ["/dashboard/:path*"],
}
