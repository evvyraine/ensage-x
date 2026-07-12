import "server-only"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

const globalDb = globalThis as unknown as { pool?: Pool }
export function database() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is required")
  const pool =
    globalDb.pool ??
    new Pool({
      connectionString: url,
      max: 20,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 30_000,
      ssl:
        process.env.DATABASE_SSL === "true"
          ? { rejectUnauthorized: true }
          : undefined,
    })
  if (process.env.NODE_ENV !== "production") globalDb.pool = pool
  return drizzle(pool, { schema })
}
