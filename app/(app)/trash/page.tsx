import { PageHeading } from "@/components/app/page-heading"
import { ShareList } from "@/components/app/share-list"
import { ownerShares } from "@/lib/server/queries"
export const dynamic = "force-dynamic"
export default async function Trash() {
  const rows = await ownerShares({ state: "trashed" })
  return (
    <>
      <PageHeading
        title="Trash"
        description="Deleted shares are retained for 30 days before permanent removal."
      />
      <ShareList shares={rows} trash />
    </>
  )
}
