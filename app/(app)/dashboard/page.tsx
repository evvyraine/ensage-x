import Link from "next/link"
import { ArrowUpRight, Boxes, Eye, FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeading } from "@/components/app/page-heading"
import { ShareList } from "@/components/app/share-list"
export default function Dashboard() {
  return (
    <>
      <PageHeading
        title="Good to see you"
        description="Everything you’ve shared, at a glance."
        action={
          <Button asChild>
            <Link href="/new">
              <Plus />
              New share
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          [FileText, "42", "Active shares"],
          [Eye, "1,284", "Total views"],
          [Boxes, "6", "Collections"],
        ].map(([Icon, value, label]) => (
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
      <ShareList />
    </>
  )
}
