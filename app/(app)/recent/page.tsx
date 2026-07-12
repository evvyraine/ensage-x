import { PageHeading } from "@/components/app/page-heading"
import { ShareList } from "@/components/app/share-list"
export default function Recent() {
  return (
    <>
      <PageHeading
        title="Recently viewed"
        description="Quickly return to shares you opened recently."
      />
      <ShareList />
    </>
  )
}
