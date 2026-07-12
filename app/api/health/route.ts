import { sql } from "drizzle-orm"
import { database } from "@/lib/db"
export async function GET() {
  try {
    await database().execute(sql`select 1`)
    return Response.json({ ok: true, service: "ensage" })
  } catch {
    return Response.json({ ok: false, service: "ensage" }, { status: 503 })
  }
}
