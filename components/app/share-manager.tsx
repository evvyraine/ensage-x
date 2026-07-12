"use client"
import { useRouter } from "next/navigation"
import { Copy, RotateCcw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
export function ShareManager({
  share,
}: {
  share: {
    id: string
    state: string
    slug: string
    visibility: string
    expiresAt: string | null
    viewCount: number
  }
}) {
  const router = useRouter()
  async function mutate(action: "trash" | "restore" | "delete") {
    const response = await fetch(`/api/v1/shares/${share.id}`, {
      method: action === "delete" ? "DELETE" : "PATCH",
      headers: { "content-type": "application/json" },
      body: action === "delete" ? undefined : JSON.stringify({ action }),
    })
    if (!response.ok) {
      toast.error("Action failed")
      return
    }
    toast.success(
      action === "restore"
        ? "Share restored"
        : action === "trash"
          ? "Moved to trash"
          : "Permanently deleted"
    )
    if (action === "restore") router.refresh()
    else router.push(action === "trash" ? "/trash" : "/shares")
  }
  async function copy() {
    await navigator.clipboard.writeText(`${location.origin}/s/${share.slug}`)
    toast.success("Link copied")
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Visibility</dt>
            <dd>{share.visibility}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Views</dt>
            <dd>{share.viewCount}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Expires</dt>
            <dd>
              {share.expiresAt
                ? new Date(share.expiresAt).toLocaleDateString()
                : "Never"}
            </dd>
          </div>
        </dl>
        <Button variant="outline" className="w-full" onClick={copy}>
          <Copy />
          Copy public link
        </Button>
        {share.state === "trashed" ? (
          <>
            <Button className="w-full" onClick={() => mutate("restore")}>
              <RotateCcw />
              Restore
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => mutate("delete")}
            >
              <Trash2 />
              Delete permanently
            </Button>
          </>
        ) : (
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => mutate("trash")}
          >
            <Trash2 />
            Move to trash
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
