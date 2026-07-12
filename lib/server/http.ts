import { ZodError } from "zod"
export function apiError(error: unknown) {
  if (error instanceof ZodError)
    return Response.json(
      { error: "Invalid request", issues: error.issues },
      { status: 400 }
    )
  const message = error instanceof Error ? error.message : "INTERNAL_ERROR"
  if (message === "UNAUTHORIZED")
    return Response.json({ error: "Authentication required" }, { status: 401 })
  if (message === "RATE_LIMITED")
    return Response.json({ error: "Too many requests" }, { status: 429 })
  console.error(error)
  return Response.json({ error: "Internal server error" }, { status: 500 })
}
