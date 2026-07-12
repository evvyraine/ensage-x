import { PageHeading } from "@/components/app/page-heading"
import { ShareList } from "@/components/app/share-list"
import { ownerShares } from "@/lib/server/queries"
export const dynamic = "force-dynamic"
export default async function Shares({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const rows = await ownerShares({ q })
  return (
    <>
      <PageHeading
        title={q ? `Results for “${q}”` : "All shares"}
        description={`${rows.length} share${rows.length === 1 ? "" : "s"} in your workspace.`}
      />
      <ShareList shares={rows} />
    </>
  )
}
