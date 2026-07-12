import { and, eq } from "drizzle-orm"
import { customAlphabet } from "nanoid"
import { z } from "zod"
import { database } from "@/lib/db"
import { collections, shares } from "@/lib/db/schema"
import { authenticateRequest } from "@/lib/server/auth"
import { apiError } from "@/lib/server/http"
const makeSlug = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 14)
const input = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).nullable().optional(),
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
    .optional(),
  visibility: z.enum(["private", "unlisted", "public"]).optional(),
  rotateLink: z.boolean().optional(),
})
export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(request)
    const { id } = await ctx.params
    const [collection] = await database()
      .select()
      .from(collections)
      .where(and(eq(collections.id, id), eq(collections.ownerId, user.id)))
      .limit(1)
    if (!collection)
      return Response.json({ error: "Not found" }, { status: 404 })
    const items = await database()
      .select()
      .from(shares)
      .where(
        and(
          eq(shares.ownerId, user.id),
          eq(shares.collectionId, id),
          eq(shares.state, "ready")
        )
      )
    return Response.json({ collection, shares: items })
  } catch (e) {
    return apiError(e)
  }
}
export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(request)
    const { id } = await ctx.params
    const value = input.parse(await request.json())
    const [current] = await database()
      .select()
      .from(collections)
      .where(and(eq(collections.id, id), eq(collections.ownerId, user.id)))
      .limit(1)
    if (!current) return Response.json({ error: "Not found" }, { status: 404 })
    const visibilityChanged =
      value.visibility !== undefined && value.visibility !== current.visibility
    const [updated] = await database()
      .update(collections)
      .set({
        ...value,
        slug: visibilityChanged || value.rotateLink ? makeSlug() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(collections.id, id))
      .returning()
    return Response.json({ collection: updated })
  } catch (e) {
    return apiError(e)
  }
}
export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(request)
    const { id } = await ctx.params
    await database()
      .update(shares)
      .set({ collectionId: null })
      .where(and(eq(shares.ownerId, user.id), eq(shares.collectionId, id)))
    const [deleted] = await database()
      .delete(collections)
      .where(and(eq(collections.id, id), eq(collections.ownerId, user.id)))
      .returning({ id: collections.id })
    return deleted
      ? new Response(null, { status: 204 })
      : Response.json({ error: "Not found" }, { status: 404 })
  } catch (e) {
    return apiError(e)
  }
}
