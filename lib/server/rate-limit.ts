import "server-only"
import { sql } from "drizzle-orm"
import { database } from "@/lib/db"

export async function enforceRateLimit(
  key: string,
  limit: number,
  windowSeconds = 60
) {
  const bucket = new Date(
    Math.floor(Date.now() / (windowSeconds * 1000)) * windowSeconds * 1000
  )
  const result = await database().execute(sql`
    INSERT INTO rate_limits (key, bucket, count) VALUES (${key}, ${bucket}, 1)
    ON CONFLICT (key, bucket) DO UPDATE SET count = rate_limits.count + 1
    RETURNING count`)
  const count = Number(result.rows[0]?.count ?? limit + 1)
  if (count > limit) throw new Error("RATE_LIMITED")
  return {
    limit,
    remaining: Math.max(0, limit - count),
    resetAt: new Date(bucket.getTime() + windowSeconds * 1000),
  }
}
