import { randomBytes } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { dirname, join } from "node:path"
import argon2 from "argon2"
import pg from "pg"

const arg = (name) => { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1] : undefined }
const name = arg("--name") ?? "Local development"
const clerkId = arg("--clerk-id")
const configure = process.argv.includes("--configure")
const url = arg("--url") ?? "http://localhost:3000"
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required")
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 })
try {
  const result = clerkId ? await pool.query("select id from users where clerk_id = $1", [clerkId]) : await pool.query("select id from users order by created_at limit 2")
  if (!result.rows.length) throw new Error("No local user found. Sign in to ensage once first.")
  if (!clerkId && result.rows.length > 1) throw new Error("Multiple users found. Pass --clerk-id user_…")
  const secret = `ens_${randomBytes(32).toString("base64url")}`
  await pool.query("insert into api_keys (owner_id, name, prefix, secret_hash) values ($1, $2, $3, $4)", [result.rows[0].id, name, secret.slice(0, 12), await argon2.hash(secret)])
  if (configure) {
    const path = join(homedir(), ".config", "ensage", "config.json")
    await mkdir(dirname(path), { recursive: true, mode: 0o700 })
    await writeFile(path, JSON.stringify({ url, token: secret }, null, 2), { mode: 0o600 })
    console.log(`API key created and CLI configured for ${url}.`)
  } else {
    console.log("API key created. Copy it now; it cannot be shown again:\n")
    console.log(secret)
  }
} finally { await pool.end() }
