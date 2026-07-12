import { PageHeading } from "@/components/app/page-heading"
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
export default function Settings() {
  return (
    <>
      <PageHeading
        title="Workspace settings"
        description="Safe defaults for every new share. Stored in PostgreSQL."
      />
      <div className="max-w-3xl space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Sharing defaults</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>Default visibility</Label>
              <Select defaultValue="unlisted">
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
              <Select defaultValue="never">
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
            <Label>Maximum file size</Label>
            <div className="mt-2 flex gap-2">
              <Input type="number" defaultValue="100" />
              <span className="grid place-items-center rounded-md border px-4 text-sm text-muted-foreground">
                MB
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Instance administrators can enforce a lower hard ceiling.
            </p>
          </CardContent>
        </Card>
        <Button>Save settings</Button>
      </div>
    </>
  )
}
