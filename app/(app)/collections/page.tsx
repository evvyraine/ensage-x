import { Boxes, Plus } from "lucide-react"
import { PageHeading } from "@/components/app/page-heading"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
const collections = [
  { name: "Product launch", count: 12, access: "Unlisted" },
  { name: "Engineering notes", count: 24, access: "Private" },
  { name: "Brand assets", count: 8, access: "Public" },
]
export default function Collections() {
  return (
    <>
      <PageHeading
        title="Collections"
        description="Group related shares and optionally publish the whole set."
        action={
          <Button>
            <Plus />
            New collection
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {collections.map((c) => (
          <Card key={c.name} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="mb-8 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Boxes className="size-5" />
              </div>
              <h2 className="font-heading text-xl font-semibold">{c.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {c.count} shares · {c.access}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
