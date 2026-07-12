"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Code2, FileUp, Link2, LockKeyhole } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
type Collection = { id: string; name: string }
export function NewShareForm({
  defaults,
  collections = [],
  initialCollectionId,
  onCreated,
}: {
  defaults: {
    visibility: "private" | "unlisted" | "public"
    ttl: number | null
    maxUploadBytes: number
  }
  collections?: Collection[]
  initialCollectionId?: string | null
  onCreated?: (share: { id: string; slug: string }) => void
}) {
  const [kind, setKind] = useState("text"),
    [busy, setBusy] = useState(false)
  const router = useRouter()
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    const form = new FormData(event.currentTarget)
    const collectionId =
      form.get("collectionId") === "none"
        ? null
        : String(form.get("collectionId") || "") || null
    let response: Response
    if (kind === "file") {
      const file = form.get("file")
      if (!(file instanceof File) || !file.size) {
        toast.error("Choose a file")
        setBusy(false)
        return
      }
      response = await fetch("/api/v1/uploads", {
        method: "POST",
        headers: {
          "content-type": file.type || "application/octet-stream",
          "x-ensage-filename": encodeURIComponent(file.name),
          "x-ensage-visibility": String(form.get("visibility")),
          ...(collectionId ? { "x-ensage-collection": collectionId } : {}),
        },
        body: file,
      })
    } else {
      const share =
        kind === "text"
          ? {
              kind,
              content: form.get("content"),
              title: form.get("title"),
              language: "text",
            }
          : { kind: "link", url: form.get("url"), title: form.get("title") }
      response = await fetch("/api/v1/shares", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          share,
          collectionId,
          visibility: form.get("visibility"),
          password: form.get("password") || undefined,
          expiresInHours:
            form.get("ttl") === "never" ? null : Number(form.get("ttl")),
        }),
      })
    }
    const data = await response.json()
    setBusy(false)
    if (!response.ok) {
      toast.error(data.error ?? "Could not create share")
      return
    }
    toast.success("Share created")
    event.currentTarget.reset()
    onCreated?.(data.share)
    router.refresh()
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <Label htmlFor="title">
          Title <span className="text-muted-foreground">optional</span>
        </Label>
        <Input
          id="title"
          name="title"
          className="mt-2"
          placeholder="A useful name"
          maxLength={160}
        />
      </div>
      <Tabs value={kind} onValueChange={setKind}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text">
            <Code2 />
            Text
          </TabsTrigger>
          <TabsTrigger value="file">
            <FileUp />
            File
          </TabsTrigger>
          <TabsTrigger value="link">
            <Link2 />
            Link
          </TabsTrigger>
        </TabsList>
        <TabsContent value="text">
          <Textarea
            name="content"
            required={kind === "text"}
            className="mt-3 min-h-44 font-mono"
            placeholder="Paste text, code, logs, or notes…"
          />
        </TabsContent>
        <TabsContent value="file">
          <label className="mt-3 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/20 p-4 text-center">
            <FileUp className="mb-3 size-7 text-primary" />
            <span className="font-medium">Choose a file</span>
            <span className="text-xs text-muted-foreground">
              Up to {Math.floor(defaults.maxUploadBytes / 1048576)} MB
            </span>
            <Input
              name="file"
              type="file"
              required={kind === "file"}
              className="mt-4 max-w-sm"
            />
          </label>
        </TabsContent>
        <TabsContent value="link">
          <Input
            name="url"
            required={kind === "link"}
            type="url"
            className="mt-3"
            placeholder="https://example.com"
          />
        </TabsContent>
      </Tabs>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Collection</Label>
          <Select
            name="collectionId"
            defaultValue={initialCollectionId ?? "none"}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No collection</SelectItem>
              {collections.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Visibility</Label>
          <Select name="visibility" defaultValue={defaults.visibility}>
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
          <Label>Expires</Label>
          <Select
            name="ttl"
            defaultValue={defaults.ttl ? String(defaults.ttl) : "never"}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 hour</SelectItem>
              <SelectItem value="24">24 hours</SelectItem>
              <SelectItem value="168">7 days</SelectItem>
              <SelectItem value="never">Never</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Password</Label>
          <div className="relative mt-2">
            <LockKeyhole className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              name="password"
              type="password"
              minLength={8}
              className="pl-9"
              placeholder="Optional"
            />
          </div>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Creating…" : "Create secure link"}
      </Button>
    </form>
  )
}
