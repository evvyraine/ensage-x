import { PageHeading } from "@/components/app/page-heading"
import { CollectionGrid } from "@/components/app/collection-grid"
import { ownerCollections } from "@/lib/server/queries"
export const dynamic = "force-dynamic"
export default async function Collections() {
  const rows = await ownerCollections()
  return (
    <>
      <PageHeading
        title="Collections"
        description="Group related shares and optionally publish the whole set."
      />
      <CollectionGrid collections={rows} />
    </>
  )
}
