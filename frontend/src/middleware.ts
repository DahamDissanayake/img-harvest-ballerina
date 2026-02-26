import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Protect the following routes. The landing page (/) and login (/login) remain accessible.
  matcher: ["/search/:path*", "/gallery/:path*", "/api/telemetry/:path*"],
};
