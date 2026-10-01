import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/admin/login" },
});

export const config = {
  // Protect every /admin page and every /api/admin route except the login page itself.
  matcher: ["/admin/((?!login).*)", "/api/admin/:path*"],
};
