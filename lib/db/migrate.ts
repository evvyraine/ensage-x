import { migrate } from "drizzle-orm/node-postgres/migrator"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is required")
const pool = new Pool({ connectionString })
try {
  await migrate(drizzle(pool), { migrationsFolder: "drizzle" })
  console.log("Database migrations complete")
} finally {
  await pool.end()
}
