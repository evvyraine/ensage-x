"use client"
import { useEffect, useState } from "react"
import {
  Copy,
  FileText,
  Link2,
  Paperclip,
  RotateCw,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import type { ShareSummary } from "./share-list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
export function ShareEditOverlay({
  share,
  divided = false,
  trash = false,
}: {
  share: ShareSummary
  divided?: boolean
  trash?: boolean
}) {
  const mobile = useIsMobile(),
    router = useRouter()
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [collections, setCollections] = useState<{ id: string; name: string }[]>([])
  const Icon =
    share.kind === "text" ? FileText : share.kind === "file" ? Paperclip : Link2
  useEffect(() => {
    if (open)
      fetch("/api/v1/collections")
        .then((r) => r.json())
        .then((d) => setCollections(d.collections ?? []))
  }, [open])
  async function save(form: FormData) {
    setBusy(true)
    const response = await fetch(`/api/v1/shares/${share.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "update",
        title: form.get("title") || null,
        visibility: form.get("visibility"),
        collectionId:
          form.get("collectionId") === "none" ? null : form.get("collectionId"),
        ...(share.kind === "text" ? { content: form.get("content") } : {}),
        ...(share.kind === "link" ? { targetUrl: form.get("targetUrl") } : {}),
      }),
    })
    setBusy(false)
    if (!response.ok) {
      toast.error(
        (await response.json().catch(() => ({}))).error ??
          "Could not update share"
      )
      return
    }
    toast.success("Share updated and link rotated if access changed")
    setOpen(false)
    router.refresh()
  }
  async function action(value: "trash" | "restore" | "delete" | "rotate") {
    const response = await fetch(`/api/v1/shares/${share.id}`, {
      method: value === "delete" ? "DELETE" : "PATCH",
      headers: { "content-type": "application/json" },
      body:
        value === "delete"
          ? undefined
          : JSON.stringify(
              value === "rotate"
                ? { action: "update", rotateLink: true }
                : { action: value }
            ),
    })
    if (!response.ok) {
      toast.error("Action failed")
      return
    }
    toast.success(
      value === "rotate"
        ? "Public link revoked and regenerated"
        : "Share updated"
    )
    setOpen(false)
    router.refresh()
  }
  const trigger = (
    <button
      className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-accent/60"
      style={{ borderTop: divided ? "1px solid var(--border)" : undefined }}
    >
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">
          {share.title || share.originalName || "Untitled share"}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {share.slug} · {share.createdAt.toLocaleDateString()} ·{" "}
          {share.viewCount} views
        </div>
      </div>
      <Badge variant="secondary">{share.kind}</Badge>
    </button>
  )
  const content = (
    <>
      <form action={save} className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            name="title"
            defaultValue={share.title ?? ""}
            className="mt-2"
          />
        </div>
        {share.kind === "text" && (
          <div>
            <Label>Content</Label>
            <Textarea
              name="content"
              defaultValue={share.content ?? ""}
              className="mt-2 max-h-52 min-h-32 font-mono"
              required
            />
          </div>
        )}
        {share.kind === "link" && (
          <div>
            <Label>Destination URL</Label>
            <Input
              name="targetUrl"
              type="url"
              defaultValue={share.targetUrl ?? ""}
              className="mt-2"
              required
            />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Visibility</Label>
            <Select name="visibility" defaultValue={share.visibility}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="unlisted">Anyone with link</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Collection</Label>
            <Select
              name="collectionId"
              defaultValue={share.collectionId ?? "none"}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No collection</SelectItem>
                {collections.map((c) => (
                  <SelectItem value={c.id} key={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Changing visibility automatically revokes the current public link.
        </p>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </form>
      <div className="mt-4 grid gap-2 border-t pt-4">
        <Button
          variant="outline"
          onClick={() =>
            navigator.clipboard
              .writeText(`${location.origin}/s/${share.slug}`)
              .then(() => toast.success("Link copied"))
          }
        >
          <Copy />
          Copy current link
        </Button>
        <Button variant="outline" onClick={() => action("rotate")}>
          <RotateCw />
          Revoke and generate new link
        </Button>
        {trash ? (
          <>
            <Button onClick={() => action("restore")}>Restore share</Button>
            <Button variant="destructive" onClick={() => action("delete")}>
              <Trash2 />
              Delete permanently
            </Button>
          </>
        ) : (
          <Button variant="destructive" onClick={() => action("trash")}>
            <Trash2 />
            Move to trash
          </Button>
        )}
      </div>
    </>
  )
  if (mobile)
    return (
      <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
        <DrawerTrigger render={trigger} />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Manage share</DrawerTitle>
            <DrawerDescription>
              Edit content, access, collection, or public link.
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto p-4 pb-8">{content}</div>
        </DrawerContent>
      </Drawer>
    )
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger} />
      <PopoverContent
        side="right"
        align="start"
        className="max-h-[85vh] w-[520px] overflow-y-auto p-5"
      >
        <PopoverHeader>
          <PopoverTitle>Manage share</PopoverTitle>
          <PopoverDescription>
            Edit content, access, collection, or public link.
          </PopoverDescription>
        </PopoverHeader>
        {content}
      </PopoverContent>
    </Popover>
  )
}
