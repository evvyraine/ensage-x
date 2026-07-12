import { clerkMiddleware } from "@clerk/nextjs/server"

// Clerk populates request authentication here. Authorization is deliberately
// enforced at each page, route handler, and data-access boundary so browser
// sessions and ensage API keys can coexist without path-matcher gaps.
export default clerkMiddleware()

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
}
