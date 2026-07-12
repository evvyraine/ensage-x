import { NewShareForm } from "@/components/app/new-share-form"
import { PageHeading } from "@/components/app/page-heading"
export default function NewShare() {
  return (
    <>
      <PageHeading
        title="Share something"
        description="Create a secure link in a few seconds."
      />
      <NewShareForm />
    </>
  )
}
