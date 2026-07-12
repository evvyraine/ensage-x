import { PageHeading } from "@/components/app/page-heading"
import { ShareList } from "@/components/app/share-list"
export default function Trash() {
  return (
    <>
      <PageHeading
        title="Trash"
        description="Deleted shares are retained for 30 days before permanent removal."
      />
      <ShareList empty />
    </>
  )
}
