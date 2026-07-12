import { UserProfile } from "@clerk/nextjs"
import { PageHeading } from "@/components/app/page-heading"
export default function Account() {
  return (
    <>
      <PageHeading
        title="Account"
        description="Manage your identity, security, and active sessions."
      />
      <UserProfile routing="hash" />
    </>
  )
}
