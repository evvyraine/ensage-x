import { rm } from "node:fs/promises"
import { resolve } from "node:path"
import pg from "pg"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 })
const storageRoot = resolve(process.cwd(), "data", "storage")
async function sweep() {
  const client = await pool.connect()
  try {
    const { rows } = await client.query(`select id, storage_key from shares where (expires_at is not null and expires_at < now()) or state = 'deleted' or (state = 'trashed' and trashed_at < now() - interval '30 days') limit 500`)
    for (const row of rows) {
      if (row.storage_key) {
        const target = resolve(storageRoot, row.storage_key)
        if (target.startsWith(`${storageRoot}/`)) await rm(target, { force: true }).catch(() => {})
      }
      await client.query("delete from shares where id = $1", [row.id])
    }
    if (rows.length) console.log(`[cleanup] permanently removed ${rows.length} shares`)
    await client.query("delete from rate_limits where bucket < now() - interval '1 day'")
  } finally { client.release() }
}
await sweep()
if (process.argv.includes("--watch")) setInterval(() => sweep().catch((error) => console.error("[cleanup]", error)), 60 * 60 * 1000)
else await pool.end()
