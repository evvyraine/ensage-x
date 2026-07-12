import { PageHeading } from "@/components/app/page-heading"
import { ShareList } from "@/components/app/share-list"
export default async function Shares({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  return (
    <>
      <PageHeading
        title={q ? `Results for “${q}”` : "All shares"}
        description="Search, organize, and manage everything you have published."
      />
      <ShareList />
    </>
  )
}
