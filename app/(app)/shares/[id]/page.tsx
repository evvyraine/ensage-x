import { notFound } from "next/navigation"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { PageHeading } from "@/components/app/page-heading"
import { ShareManager } from "@/components/app/share-manager"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ownerShare } from "@/lib/server/queries"
export const dynamic = "force-dynamic"
export default async function ManageShare({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const share = await ownerShare(id)
  if (!share) notFound()
  return (
    <>
      <PageHeading
        title={share.title || share.originalName || "Untitled share"}
        description={`Created ${share.createdAt.toLocaleString()}`}
        action={
          <div className="flex gap-2">
            <Badge variant="secondary">{share.state}</Badge>
            <Button variant="outline" asChild>
              <Link href={`/s/${share.slug}`} target="_blank">
                Open share <ExternalLink />
              </Link>
            </Button>
          </div>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          {share.kind === "text" ? (
            <pre className="max-h-[65vh] overflow-auto rounded-2xl border bg-zinc-950 p-6 font-mono text-sm leading-7 text-zinc-200">
              <code>{share.content}</code>
            </pre>
          ) : share.kind === "link" ? (
            <div className="rounded-2xl border bg-card p-6 break-all">
              {share.targetUrl}
            </div>
          ) : (
            <div className="rounded-2xl border bg-card p-6">
              <p>{share.originalName}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {(share.sizeBytes / 1048576).toFixed(2)} MB · {share.mediaType}
              </p>
              <Button asChild className="mt-5">
                <a href={`/api/v1/shares/${share.id}/content`}>Download</a>
              </Button>
            </div>
          )}
        </div>
        <ShareManager
          share={{
            id: share.id,
            state: share.state,
            slug: share.slug,
            visibility: share.visibility,
            expiresAt: share.expiresAt?.toISOString() ?? null,
            viewCount: share.viewCount,
          }}
        />
      </div>
    </>
  )
}
