import { FileText } from "lucide-react"
import type { InferSelectModel } from "drizzle-orm"
import type { shares } from "@/lib/db/schema"
import { ShareRow } from "./share-row"

export type ShareSummary = InferSelectModel<typeof shares>
export function ShareList({
  shares: rows,
  trash = false,
}: {
  shares: ShareSummary[]
  trash?: boolean
}) {
  if (!rows.length)
    return (
      <div className="rounded-2xl border border-dashed py-20 text-center">
        <FileText className="mx-auto mb-4 size-8 text-muted-foreground" />
        <h3 className="font-medium">Nothing here yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {trash
            ? "Trashed shares will appear here for 30 days."
            : "Create your first share and it will appear here."}
        </p>
      </div>
    )
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      {rows.map((share, index) => (
        <ShareRow
          key={share.id}
          share={share}
          trash={trash}
          divided={index > 0}
        />
      ))}
    </div>
  )
}
