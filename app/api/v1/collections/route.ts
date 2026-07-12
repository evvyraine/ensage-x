import { desc, eq } from "drizzle-orm"
import { z } from "zod"
import { database } from "@/lib/db"
import { collections } from "@/lib/db/schema"
import { authenticateRequest } from "@/lib/server/auth"
import { apiError } from "@/lib/server/http"
import { randomToken } from "@/lib/server/security"
const input = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  visibility: z.enum(["private", "unlisted", "public"]).default("private"),
  icon: z
    .enum([
      "folder",
      "code",
      "briefcase",
      "book",
      "palette",
      "rocket",
      "heart",
      "star",
    ])
    .default("folder"),
})
const toSlug = (name: string) =>
  `${
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50) || "collection"
  }-${randomToken(4).toLowerCase()}`
export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request)
    const rows = await database()
      .select()
      .from(collections)
      .where(eq(collections.ownerId, user.id))
      .orderBy(desc(collections.updatedAt))
    return Response.json({ collections: rows })
  } catch (e) {
    return apiError(e)
  }
}
export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request)
    const value = input.parse(await request.json())
    const [created] = await database()
      .insert(collections)
      .values({ ...value, ownerId: user.id, slug: toSlug(value.name) })
      .returning()
    return Response.json({ collection: created }, { status: 201 })
  } catch (e) {
    return apiError(e)
  }
}
