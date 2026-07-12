import Link from "next/link"
import { ArrowUpRight, Boxes, Eye, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeading } from "@/components/app/page-heading"
import { ShareList } from "@/components/app/share-list"
import { workspaceData } from "@/lib/server/queries"
export const dynamic = "force-dynamic"
export default async function Dashboard() {
  const { stats, recent } = await workspaceData()
  return (
    <>
      <PageHeading
        title="Your workspace"
        description="Everything you’ve shared, at a glance."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {(
          [
            [FileText, stats.active, "Active shares"],
            [Eye, stats.views, "Total views"],
            [Boxes, stats.collections, "Collections"],
          ] as const
        ).map(([Icon, value, label]) => (
          <Card key={String(label)}>
            <CardContent className="p-5">
              <Icon className="size-4 text-muted-foreground" />
              <div className="mt-5 text-2xl font-semibold">{String(value)}</div>
              <div className="text-xs text-muted-foreground">
                {String(label)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-10 mb-4 flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold">Recently created</h2>
        <Button variant="ghost" asChild>
          <Link href="/shares">
            View all <ArrowUpRight />
          </Link>
        </Button>
      </div>
      <ShareList shares={recent} />
    </>
  )
}
