import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  // Debug mode for Vercel logs
  debug: true,
});

export const config = {
  // Only run on specific routes to reduce middleware load
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
