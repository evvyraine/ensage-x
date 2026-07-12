import { PageHeading } from "@/components/app/page-heading"
import { ShareList } from "@/components/app/share-list"
import { ownerShares } from "@/lib/server/queries"
export const dynamic = "force-dynamic"
export default async function Recent() {
  const rows = await ownerShares({ recent: true })
  return (
    <>
      <PageHeading
        title="Recently viewed"
        description="Quickly return to shares you opened recently."
      />
      <ShareList shares={rows} />
    </>
  )
}
