import { withAuth } from "next-auth/middleware";

// Only the big-screen admin panel is behind Google sign-in; players just enter a name.
export default withAuth({
  callbacks: {
    authorized: ({ token }) => token?.role === "admin",
  },
});

export const config = { matcher: ["/admin/:path*"] };
