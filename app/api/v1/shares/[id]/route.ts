import { and, eq } from "drizzle-orm"
import { database } from "@/lib/db"
import { auditEvents, shares } from "@/lib/db/schema"
import { authenticateRequest } from "@/lib/server/auth"
import { apiError } from "@/lib/server/http"
import { customAlphabet } from "nanoid"
import { z } from "zod"

type Context = { params: Promise<{ id: string }> }
const makeSlug = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 14)
const updateInput = z.object({
  action: z.literal("update"),
  title: z.string().trim().max(160).nullable().optional(),
  visibility: z.enum(["private", "unlisted", "public"]).optional(),
  collectionId: z.uuid().nullable().optional(),
  content: z.string().min(1).max(2_000_000).optional(),
  targetUrl: z.url().optional(),
  rotateLink: z.boolean().optional(),
})
export async function GET(request: Request, ctx: Context) {
  try {
    const user = await authenticateRequest(request)
    const { id } = await ctx.params
    const [share] = await database()
      .select()
      .from(shares)
      .where(and(eq(shares.id, id), eq(shares.ownerId, user.id)))
      .limit(1)
    if (!share) return Response.json({ error: "Not found" }, { status: 404 })
    const { passwordHash, managementTokenHash, storageKey, ...safe } = share
    void passwordHash
    void managementTokenHash
    void storageKey
    return Response.json({ share: safe })
  } catch (error) {
    return apiError(error)
  }
}
export async function PATCH(request: Request, ctx: Context) {
  try {
    const user = await authenticateRequest(request)
    const { id } = await ctx.params
    const body = (await request.json()) as {
      action?: string
      [key: string]: unknown
    }
    const [share] = await database()
      .select()
      .from(shares)
      .where(and(eq(shares.id, id), eq(shares.ownerId, user.id)))
      .limit(1)
    if (!share) return Response.json({ error: "Not found" }, { status: 404 })
    if (body.action === "update") {
      const value = updateInput.parse(body)
      if (value.collectionId) {
        const { collections } = await import("@/lib/db/schema")
        const [collection] = await database()
          .select({ id: collections.id })
          .from(collections)
          .where(
            and(
              eq(collections.id, value.collectionId),
              eq(collections.ownerId, user.id)
            )
          )
          .limit(1)
        if (!collection)
          return Response.json(
            { error: "Collection not found" },
            { status: 404 }
          )
      }
      if (value.content !== undefined && share.kind !== "text")
        return Response.json(
          { error: "Only text shares have editable content" },
          { status: 400 }
        )
      if (value.targetUrl !== undefined && share.kind !== "link")
        return Response.json(
          { error: "Only link shares have a target URL" },
          { status: 400 }
        )
      const visibilityChanged =
        value.visibility !== undefined && value.visibility !== share.visibility
      const [updated] = await database()
        .update(shares)
        .set({
          title: value.title,
          visibility: value.visibility,
          collectionId: value.collectionId,
          content: value.content,
          targetUrl: value.targetUrl,
          slug: visibilityChanged || value.rotateLink ? makeSlug() : undefined,
          updatedAt: new Date(),
        })
        .where(eq(shares.id, id))
        .returning()
      await database()
        .insert(auditEvents)
        .values({
          actorId: user.id,
          action:
            visibilityChanged || value.rotateLink
              ? "share.updated_and_link_rotated"
              : "share.updated",
          resourceType: "share",
          resourceId: id,
        })
      return Response.json({ share: updated })
    }
    const state =
      body.action === "restore"
        ? "ready"
        : body.action === "trash"
          ? "trashed"
          : null
    if (!state)
      return Response.json({ error: "Unsupported action" }, { status: 400 })
    await database().transaction(async (tx) => {
      await tx
        .update(shares)
        .set({
          state,
          trashedAt: state === "trashed" ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(shares.id, id))
      await tx.insert(auditEvents).values({
        actorId: user.id,
        action: `share.${body.action}`,
        resourceType: "share",
        resourceId: id,
      })
    })
    return Response.json({ ok: true })
  } catch (error) {
    return apiError(error)
  }
}
export async function DELETE(request: Request, ctx: Context) {
  try {
    const user = await authenticateRequest(request)
    const { id } = await ctx.params
    const [deleted] = await database()
      .update(shares)
      .set({ state: "deleted", updatedAt: new Date() })
      .where(and(eq(shares.id, id), eq(shares.ownerId, user.id)))
      .returning({ id: shares.id })
    if (!deleted) return Response.json({ error: "Not found" }, { status: 404 })
    await database().insert(auditEvents).values({
      actorId: user.id,
      action: "share.deleted",
      resourceType: "share",
      resourceId: id,
    })
    return new Response(null, { status: 204 })
  } catch (error) {
    return apiError(error)
  }
}
