import Link from "next/link"
import { FileText, Link2, MoreHorizontal, Paperclip } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
const demos = [
  {
    slug: "quiet-pine-27",
    title: "API response example",
    kind: "text",
    when: "2 minutes ago",
    views: 14,
  },
  {
    slug: "silver-lake-88",
    title: "Launch assets.zip",
    kind: "file",
    when: "Yesterday",
    views: 6,
  },
  {
    slug: "warm-sky-14",
    title: "Design system reference",
    kind: "link",
    when: "3 days ago",
    views: 31,
  },
]
export function ShareList({ empty = false }: { empty?: boolean }) {
  if (empty)
    return (
      <div className="rounded-2xl border border-dashed py-20 text-center">
        <FileText className="mx-auto mb-4 size-8 text-muted-foreground" />
        <h3 className="font-medium">Nothing here yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your shares will appear here.
        </p>
      </div>
    )
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      {demos.map((s, i) => {
        const Icon =
          s.kind === "text" ? FileText : s.kind === "file" ? Paperclip : Link2
        return (
          <Link
            href={`/s/${s.slug}`}
            key={s.slug}
            className="flex items-center gap-4 px-5 py-4 hover:bg-accent/60"
            style={{ borderTop: i ? "1px solid var(--border)" : undefined }}
          >
            <div className="grid size-10 place-items-center rounded-xl bg-muted">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{s.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {s.slug} · {s.when} · {s.views} views
              </div>
            </div>
            <Badge variant="secondary">{s.kind}</Badge>
            <Button variant="ghost" size="icon">
              <MoreHorizontal />
            </Button>
          </Link>
        )
      })}
    </div>
  )
}
