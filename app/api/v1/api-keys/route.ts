import { database } from "@/lib/db"
import { apiKeys, auditEvents } from "@/lib/db/schema"
import { requireUser } from "@/lib/server/auth"
import { apiError } from "@/lib/server/http"
import { hashSecret, randomToken } from "@/lib/server/security"
import { z } from "zod"
export async function POST(request: Request) {
  try {
    const user = await requireUser()
    const { name } = z
      .object({ name: z.string().trim().min(1).max(80) })
      .parse(await request.json())
    const secret = `ens_${randomToken(32)}`
    const [key] = await database().transaction(async (tx) => {
      const rows = await tx
        .insert(apiKeys)
        .values({
          ownerId: user.id,
          name,
          prefix: secret.slice(0, 12),
          secretHash: await hashSecret(secret),
        })
        .returning({
          id: apiKeys.id,
          name: apiKeys.name,
          prefix: apiKeys.prefix,
          createdAt: apiKeys.createdAt,
        })
      await tx.insert(auditEvents).values({
        actorId: user.id,
        action: "api_key.created",
        resourceType: "api_key",
        resourceId: rows[0].id,
      })
      return rows
    })
    return Response.json({ key, secret }, { status: 201 })
  } catch (e) {
    return apiError(e)
  }
}
