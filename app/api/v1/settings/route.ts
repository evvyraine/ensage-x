import { eq } from "drizzle-orm"
import { z } from "zod"
import { database } from "@/lib/db"
import { settings } from "@/lib/db/schema"
import { authenticateRequest } from "@/lib/server/auth"
import { apiError } from "@/lib/server/http"
const input = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  defaultVisibility: z.enum(["private", "unlisted", "public"]).optional(),
  defaultTtlHours: z.number().int().min(1).max(8760).nullable().optional(),
  maxUploadBytes: z.number().int().min(1048576).max(1073741824).optional(),
})
export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request)
    const [row] = await database()
      .select()
      .from(settings)
      .where(eq(settings.userId, user.id))
      .limit(1)
    return Response.json({ settings: row })
  } catch (e) {
    return apiError(e)
  }
}
export async function PATCH(request: Request) {
  try {
    const user = await authenticateRequest(request)
    const value = input.parse(await request.json())
    const [row] = await database()
      .update(settings)
      .set({ ...value, updatedAt: new Date() })
      .where(eq(settings.userId, user.id))
      .returning()
    return Response.json({ settings: row })
  } catch (e) {
    return apiError(e)
  }
}
