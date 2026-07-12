"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Code2, FileUp, Link2, LockKeyhole } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

export function NewShareForm() {
  const [kind, setKind] = useState("text"),
    [busy, setBusy] = useState(false)
  const router = useRouter()
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    const form = new FormData(event.currentTarget)
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
          "content-length": String(file.size),
          "x-ensage-filename": encodeURIComponent(file.name),
          "x-ensage-visibility": String(form.get("visibility")),
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
    router.push(`/s/${data.share.slug}`)
  }
  return (
    <Card className="mx-auto max-w-3xl">
      <CardContent className="p-6">
        <form onSubmit={submit}>
          <div className="mb-5">
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
                className="mt-4 min-h-72 font-mono"
                placeholder="Paste text, code, logs, or notes…"
              />
            </TabsContent>
            <TabsContent value="file">
              <label className="mt-4 flex min-h-60 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/20 text-center">
                <FileUp className="mb-4 size-8 text-primary" />
                <span className="font-medium">Choose a file to share</span>
                <span className="mt-1 text-sm text-muted-foreground">
                  Streams directly to secure local storage · up to 100 MB
                </span>
                <Input
                  name="file"
                  type="file"
                  required={kind === "file"}
                  className="mt-5 max-w-sm"
                />
              </label>
            </TabsContent>
            <TabsContent value="link">
              <Input
                name="url"
                required={kind === "link"}
                type="url"
                className="mt-4"
                placeholder="https://example.com"
              />
            </TabsContent>
          </Tabs>
          <div className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-3">
            <div>
              <Label>Visibility</Label>
              <Select name="visibility" defaultValue="unlisted">
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
              <Select name="ttl" defaultValue="never">
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
          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Creator management access is stored separately.
            </p>
            <Button disabled={busy}>
              {busy ? "Creating…" : "Create secure link"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
