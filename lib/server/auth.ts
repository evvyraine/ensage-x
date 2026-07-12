import "server-only"
import { auth } from "@clerk/nextjs/server"
import { and, eq, isNull } from "drizzle-orm"
import { database } from "@/lib/db"
import { apiKeys, settings, users } from "@/lib/db/schema"
import { verifySecret } from "./security"

export async function requireUser() {
  const session = await auth()
  if (!session.userId) throw new Error("UNAUTHORIZED")
  const db = database()
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, session.userId))
    .limit(1)
  if (user) return user
  const [created] = await db
    .insert(users)
    .values({ clerkId: session.userId })
    .returning()
  await db.insert(settings).values({ userId: created.id }).onConflictDoNothing()
  return created
}

export async function authenticateRequest(request: Request) {
  const bearer = request.headers
    .get("authorization")
    ?.match(/^Bearer (ens_[A-Za-z0-9_-]+)$/)?.[1]
  if (!bearer) return requireUser()
  const prefix = bearer.slice(0, 12)
  const db = database()
  const rows = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.prefix, prefix), isNull(apiKeys.revokedAt)))
  for (const key of rows)
    if (
      (!key.expiresAt || key.expiresAt > new Date()) &&
      (await verifySecret(key.secretHash, bearer))
    ) {
      await db
        .update(apiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(apiKeys.id, key.id))
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, key.ownerId))
        .limit(1)
      if (user) return user
    }
  throw new Error("UNAUTHORIZED")
}
