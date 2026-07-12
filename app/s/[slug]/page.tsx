import { notFound } from "next/navigation"
import { and, eq, ne } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import { database } from "@/lib/db"
import { shares, users } from "@/lib/db/schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
export const dynamic = "force-dynamic"

export default async function PublicShare({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let share
  try {
    ;[share] = await database()
      .select()
      .from(shares)
      .where(and(eq(shares.slug, slug), ne(shares.state, "deleted")))
      .limit(1)
  } catch {
    return <Unavailable />
  }
  if (
    !share ||
    share.state === "trashed" ||
    (share.expiresAt && share.expiresAt < new Date())
  )
    notFound()
  const session = await auth()
  let isOwner = false
  if (session.userId) {
    const [user] = await database()
      .select()
      .from(users)
      .where(eq(users.clerkId, session.userId))
      .limit(1)
    isOwner = user?.id === share.ownerId
  }
  if (share.visibility === "private" && !isOwner) notFound()
  if (share.passwordHash && !isOwner)
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <div className="w-full max-w-sm rounded-2xl border bg-card p-7">
          <h1 className="font-heading text-2xl font-semibold">
            Protected share
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to request access to this protected share.
          </p>
          <Button className="mt-6 w-full" asChild>
            <Link href="/sign-in">Sign in to continue</Link>
          </Button>
        </div>
      </main>
    )
  return (
    <main className="mx-auto max-w-5xl p-6 py-12">
      <header className="mb-8 flex items-center">
        <Link href="/" className="font-heading text-xl font-semibold">
          ensage
        </Link>
        <Badge className="ml-auto" variant="secondary">
          {share.kind}
        </Badge>
      </header>
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-semibold">
          {share.title || "Untitled share"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Shared {share.createdAt.toLocaleDateString()} · {share.viewCount}{" "}
          views
        </p>
      </div>
      {share.kind === "text" ? (
        <pre className="overflow-auto rounded-2xl border bg-zinc-950 p-6 font-mono text-sm leading-7 text-zinc-200">
          <code>{share.content}</code>
        </pre>
      ) : share.kind === "link" ? (
        <div className="rounded-2xl border bg-card p-8">
          <p className="break-all text-muted-foreground">{share.targetUrl}</p>
          <Button asChild className="mt-5">
            <a
              href={share.targetUrl!}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open link
            </a>
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-8">
          <p className="text-muted-foreground">
            {share.originalName} · {(share.sizeBytes / 1048576).toFixed(1)} MB
          </p>
          <Button asChild className="mt-5">
            <a href={`/api/v1/shares/${share.id}/content`}>Download file</a>
          </Button>
        </div>
      )}
    </main>
  )
}
function Unavailable() {
  return (
    <main className="grid min-h-screen place-items-center">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-semibold">
          Storage is not configured
        </h1>
        <p className="mt-2 text-muted-foreground">
          Connect PostgreSQL to start using ensage.
        </p>
      </div>
    </main>
  )
}
