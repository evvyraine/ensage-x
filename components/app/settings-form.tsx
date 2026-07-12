"use client"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
type Settings = {
  defaultVisibility: "private" | "unlisted" | "public"
  defaultTtlHours: number | null
  maxUploadBytes: number
}
export function SettingsForm({ settings }: { settings: Settings }) {
  const [busy, setBusy] = useState(false)
  async function save(formData: FormData) {
    setBusy(true)
    const ttl = formData.get("ttl")
    const response = await fetch("/api/v1/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        defaultVisibility: formData.get("visibility"),
        defaultTtlHours: ttl === "never" ? null : Number(ttl),
        maxUploadBytes: Number(formData.get("maxUploadMb")) * 1048576,
      }),
    })
    setBusy(false)
    if (response.ok) toast.success("Settings saved")
    else toast.error("Could not save settings")
  }
  return (
    <form action={save} className="max-w-3xl space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Sharing defaults</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label>Default visibility</Label>
            <Select name="visibility" defaultValue={settings.defaultVisibility}>
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
            <Label>Default expiration</Label>
            <Select
              name="ttl"
              defaultValue={
                settings.defaultTtlHours
                  ? String(settings.defaultTtlHours)
                  : "never"
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="168">7 days</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Usage limits</CardTitle>
        </CardHeader>
        <CardContent>
          <Label>Maximum file size in MB</Label>
          <Input
            name="maxUploadMb"
            type="number"
            min={1}
            max={1024}
            defaultValue={Math.floor(settings.maxUploadBytes / 1048576)}
            className="mt-2"
          />
        </CardContent>
      </Card>
      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : "Save settings"}
      </Button>
    </form>
  )
}
