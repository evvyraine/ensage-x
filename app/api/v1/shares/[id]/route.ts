import { and, eq } from "drizzle-orm"
import { database } from "@/lib/db"
import { auditEvents, shares } from "@/lib/db/schema"
import { authenticateRequest } from "@/lib/server/auth"
import { apiError } from "@/lib/server/http"

type Context = { params: Promise<{ id: string }> }
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
    const body = (await request.json()) as { action?: string }
    const [share] = await database()
      .select()
      .from(shares)
      .where(and(eq(shares.id, id), eq(shares.ownerId, user.id)))
      .limit(1)
    if (!share) return Response.json({ error: "Not found" }, { status: 404 })
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
