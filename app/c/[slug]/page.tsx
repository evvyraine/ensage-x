import { notFound } from "next/navigation"
import Link from "next/link"
import { and, eq, ne } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { ExternalLink, FileText, Link2, Paperclip } from "lucide-react"
import { database } from "@/lib/db"
import { collections, shares, users } from "@/lib/db/schema"
import { Badge } from "@/components/ui/badge"
export const dynamic = "force-dynamic"
export default async function SharedCollection({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [collection] = await database()
    .select()
    .from(collections)
    .where(eq(collections.slug, slug))
    .limit(1)
  if (!collection) notFound()
  let owner = false
  const session = await auth()
  if (session.userId) {
    const [user] = await database()
      .select()
      .from(users)
      .where(eq(users.clerkId, session.userId))
      .limit(1)
    owner = user?.id === collection.ownerId
  }
  if (collection.visibility === "private" && !owner) notFound()
  const items = await database()
    .select()
    .from(shares)
    .where(
      and(
        eq(shares.collectionId, collection.id),
        eq(shares.state, "ready"),
        ne(shares.visibility, "private")
      )
    )
  return (
    <main className="mx-auto min-h-screen max-w-5xl p-5 py-10 sm:p-8">
      <header className="mb-12 flex items-center">
        <Link href="/" className="font-heading text-xl font-semibold">
          en<span className="text-primary">sage</span>
        </Link>
        <Badge className="ml-auto" variant="secondary">
          Shared collection
        </Badge>
      </header>
      <h1 className="font-heading text-4xl font-semibold">{collection.name}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        {collection.description || `${items.length} shared items`}
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const Icon =
            item.kind === "text"
              ? FileText
              : item.kind === "file"
                ? Paperclip
                : Link2
          return (
            <Link
              key={item.id}
              href={`/s/${item.slug}`}
              className="group rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="grid size-10 place-items-center rounded-xl bg-muted">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-medium">
                    {item.title || item.originalName || "Untitled share"}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {item.kind === "link"
                      ? item.targetUrl
                      : item.kind === "text"
                        ? item.content
                        : item.mediaType}
                  </p>
                </div>
                <ExternalLink className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>
          )
        })}
      </div>
      {!items.length && (
        <div className="mt-10 rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
          This collection has no publicly visible shares yet.
        </div>
      )}
    </main>
  )
}
