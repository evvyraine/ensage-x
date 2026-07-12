import { and, desc, eq, ilike, ne } from "drizzle-orm"
import { database } from "@/lib/db"
import { auditEvents, shares } from "@/lib/db/schema"
import { authenticateRequest } from "@/lib/server/auth"
import { apiError } from "@/lib/server/http"
import { enforceRateLimit } from "@/lib/server/rate-limit"
import { digest, hashSecret, randomToken } from "@/lib/server/security"
import { createShareInput } from "@/lib/validation/share"
import { customAlphabet } from "nanoid"

const slug = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 14)
export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request)
    const q = new URL(request.url).searchParams.get("q")
    const where = q
      ? and(
          eq(shares.ownerId, user.id),
          ne(shares.state, "deleted"),
          ilike(shares.title, `%${q.slice(0, 100)}%`)
        )
      : and(eq(shares.ownerId, user.id), ne(shares.state, "deleted"))
    const rows = await database()
      .select({
        id: shares.id,
        slug: shares.slug,
        title: shares.title,
        kind: shares.kind,
        state: shares.state,
        visibility: shares.visibility,
        sizeBytes: shares.sizeBytes,
        viewCount: shares.viewCount,
        createdAt: shares.createdAt,
      })
      .from(shares)
      .where(where)
      .orderBy(desc(shares.createdAt))
      .limit(100)
    return Response.json({ shares: rows })
  } catch (e) {
    return apiError(e)
  }
}
export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request)
    await enforceRateLimit(`share:create:${user.id}`, 30)
    const input = createShareInput.parse(await request.json())
    const managementToken = randomToken()
    const passwordHash = input.password
      ? await hashSecret(input.password)
      : null
    const now = new Date()
    const expiresAt = input.expiresInHours
      ? new Date(now.getTime() + input.expiresInHours * 3600000)
      : null
    const record = {
      ownerId: user.id,
      slug: slug(),
      kind: input.share.kind,
      state: "ready" as const,
      visibility: input.visibility,
      title: input.share.title || null,
      content: input.share.kind === "text" ? input.share.content : null,
      targetUrl: input.share.kind === "link" ? input.share.url : null,
      language: input.share.kind === "text" ? input.share.language : null,
      sizeBytes:
        input.share.kind === "text"
          ? Buffer.byteLength(input.share.content)
          : 0,
      passwordHash,
      managementTokenHash: digest(managementToken),
      expiresAt,
      collectionId: input.collectionId ?? null,
    }
    const [created] = await database().transaction(async (tx) => {
      const rows = await tx.insert(shares).values(record).returning()
      await tx.insert(auditEvents).values({
        actorId: user.id,
        action: "share.created",
        resourceType: "share",
        resourceId: rows[0].id,
      })
      return rows
    })
    return Response.json(
      {
        share: {
          id: created.id,
          slug: created.slug,
          kind: created.kind,
          title: created.title,
        },
        managementToken,
      },
      { status: 201 }
    )
  } catch (e) {
    return apiError(e)
  }
}
