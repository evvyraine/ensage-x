import "server-only"
import { and, count, desc, eq, ilike, ne, or, sql } from "drizzle-orm"
import { database } from "@/lib/db"
import { collections, recentViews, settings, shares } from "@/lib/db/schema"
import { requireUser } from "./auth"

export async function workspaceData() {
  const user = await requireUser()
  const db = database()
  const [[active], [views], [collectionCount], recent] = await Promise.all([
    db
      .select({ value: count() })
      .from(shares)
      .where(and(eq(shares.ownerId, user.id), eq(shares.state, "ready"))),
    db
      .select({ value: sql<number>`coalesce(sum(${shares.viewCount}), 0)` })
      .from(shares)
      .where(eq(shares.ownerId, user.id)),
    db
      .select({ value: count() })
      .from(collections)
      .where(eq(collections.ownerId, user.id)),
    db
      .select()
      .from(shares)
      .where(and(eq(shares.ownerId, user.id), eq(shares.state, "ready")))
      .orderBy(desc(shares.createdAt))
      .limit(6),
  ])
  return {
    user,
    stats: {
      active: Number(active.value),
      views: Number(views.value),
      collections: Number(collectionCount.value),
    },
    recent,
  }
}

export async function ownerShares(
  options: { q?: string; state?: "ready" | "trashed"; recent?: boolean } = {}
) {
  const user = await requireUser()
  const db = database()
  const state = options.state ?? "ready"
  if (options.recent)
    return db
      .select({ share: shares, viewedAt: recentViews.viewedAt })
      .from(recentViews)
      .innerJoin(shares, eq(shares.id, recentViews.shareId))
      .where(and(eq(recentViews.userId, user.id), ne(shares.state, "deleted")))
      .orderBy(desc(recentViews.viewedAt))
      .limit(100)
      .then((rows) => rows.map((r) => r.share))
  const query = options.q?.trim().slice(0, 100)
  const filter = query
    ? or(
        ilike(shares.title, `%${query}%`),
        ilike(shares.slug, `%${query}%`),
        ilike(shares.content, `%${query}%`),
        ilike(shares.originalName, `%${query}%`)
      )
    : undefined
  return db
    .select()
    .from(shares)
    .where(and(eq(shares.ownerId, user.id), eq(shares.state, state), filter))
    .orderBy(desc(state === "trashed" ? shares.trashedAt : shares.createdAt))
    .limit(100)
}

export async function ownerCollections() {
  const user = await requireUser()
  return database()
    .select()
    .from(collections)
    .where(eq(collections.ownerId, user.id))
    .orderBy(desc(collections.updatedAt))
}
export async function ownerSettings() {
  const user = await requireUser()
  const [row] = await database()
    .select()
    .from(settings)
    .where(eq(settings.userId, user.id))
    .limit(1)
  return row
}
export async function ownerShare(id: string) {
  const user = await requireUser()
  const [row] = await database()
    .select()
    .from(shares)
    .where(and(eq(shares.id, id), eq(shares.ownerId, user.id)))
    .limit(1)
  return row ?? null
}
