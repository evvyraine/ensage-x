import { database } from "@/lib/db"
import { auditEvents, shares } from "@/lib/db/schema"
import { authenticateRequest } from "@/lib/server/auth"
import { apiError } from "@/lib/server/http"
import { enforceRateLimit } from "@/lib/server/rate-limit"
import { digest, randomToken } from "@/lib/server/security"
import { deleteObject, putStream } from "@/lib/server/storage"
import { customAlphabet } from "nanoid"
import { z } from "zod"
const makeSlug = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 14)
const headersSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string().max(160).default("application/octet-stream"),
  size: z.coerce.number().int().positive().max(104857600),
  visibility: z.enum(["private", "unlisted", "public"]).default("unlisted"),
})
export async function POST(request: Request) {
  let key: string | undefined
  let id: string | undefined
  try {
    const user = await authenticateRequest(request)
    await enforceRateLimit(`upload:${user.id}`, 20)
    if (!request.body) throw new Error("EMPTY_BODY")
    const meta = headersSchema.parse({
      name: decodeURIComponent(request.headers.get("x-ensage-filename") ?? ""),
      type: request.headers.get("content-type") ?? undefined,
      size: request.headers.get("content-length"),
      visibility: request.headers.get("x-ensage-visibility") ?? undefined,
    })
    const token = randomToken()
    const slug = makeSlug()
    key = `${user.id}/${crypto.randomUUID()}`
    const [pending] = await database()
      .insert(shares)
      .values({
        ownerId: user.id,
        slug,
        kind: "file",
        state: "pending",
        visibility: meta.visibility,
        title: meta.name,
        originalName: meta.name,
        mediaType: meta.type,
        sizeBytes: meta.size,
        storageKey: key,
        managementTokenHash: digest(token),
      })
      .returning()
    id = pending.id
    await putStream(key, request.body)
    const [ready] = await database().transaction(async (tx) => {
      const rows = await tx
        .update(shares)
        .set({ state: "ready", updatedAt: new Date() })
        .where((await import("drizzle-orm")).eq(shares.id, pending.id))
        .returning()
      await tx.insert(auditEvents).values({
        actorId: user.id,
        action: "share.uploaded",
        resourceType: "share",
        resourceId: pending.id,
        data: { size: meta.size },
      })
      return rows
    })
    return Response.json(
      {
        share: {
          id: ready.id,
          slug: ready.slug,
          title: ready.title,
          kind: ready.kind,
        },
        managementToken: token,
      },
      { status: 201 }
    )
  } catch (e) {
    if (key) await deleteObject(key).catch(() => {})
    if (id)
      await database()
        .delete(shares)
        .where((await import("drizzle-orm")).eq(shares.id, id))
        .catch(() => {})
    return apiError(e)
  }
}
