"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  Boxes,
  Briefcase,
  Code2,
  Copy,
  Folder,
  Heart,
  Palette,
  Plus,
  Rocket,
  RotateCw,
  Star,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import { NewShareOverlay } from "./new-share-overlay"
import { ShareList, type ShareSummary } from "./share-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
type Collection = {
  id: string
  name: string
  description: string | null
  slug: string
  visibility: "private" | "unlisted" | "public"
  icon: string
}
const icons = {
  folder: Folder,
  code: Code2,
  briefcase: Briefcase,
  book: BookOpen,
  palette: Palette,
  rocket: Rocket,
  heart: Heart,
  star: Star,
} as const
export function CollectionGrid({ collections }: { collections: Collection[] }) {
  const [creating, setCreating] = useState(false)
  const router = useRouter()
  async function create(formData: FormData) {
    const response = await fetch("/api/v1/collections", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        description: formData.get("description"),
        icon: formData.get("icon"),
        visibility: "private",
      }),
    })
    if (!response.ok) {
      toast.error("Could not create collection")
      return
    }
    toast.success("Collection created")
    setCreating(false)
    router.refresh()
  }
  return (
    <>
      <div className="mb-5 flex justify-end">
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger render={<Button />}>
            <Plus />
            New collection
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New collection</DialogTitle>
              <DialogDescription>
                Group shares into a customizable space.
              </DialogDescription>
            </DialogHeader>
            <form action={create} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input name="name" required maxLength={100} className="mt-2" />
              </div>
              <div>
                <Label>Description</Label>
                <Input name="description" maxLength={500} className="mt-2" />
              </div>
              <IconSelect />
              <Button type="submit" className="w-full">
                Create collection
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {collections.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {collections.map((c) => (
            <CollectionCard collection={c} key={c.id} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed py-20 text-center">
          <Boxes className="mx-auto mb-4 size-8 text-muted-foreground" />
          <h3 className="font-medium">No collections yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create one to organize and share related items.
          </p>
        </div>
      )}
    </>
  )
}
function CollectionCard({ collection }: { collection: Collection }) {
  const mobile = useIsMobile(),
    router = useRouter()
  const [open, setOpen] = useState(false),
    [items, setItems] = useState<ShareSummary[]>([])
  const Icon = icons[collection.icon as keyof typeof icons] ?? Folder
  async function load(value: boolean) {
    setOpen(value)
    if (value) {
      const r = await fetch(`/api/v1/collections/${collection.id}`)
      if (r.ok) setItems((await r.json()).shares)
    }
  }
  async function save(form: FormData) {
    const response = await fetch(`/api/v1/collections/${collection.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        description: form.get("description") || null,
        icon: form.get("icon"),
        visibility: form.get("visibility"),
      }),
    })
    if (!response.ok) {
      toast.error("Could not update collection")
      return
    }
    toast.success("Collection updated and link rotated if access changed")
    setOpen(false)
    router.refresh()
  }
  async function action(kind: "rotate" | "delete") {
    const response = await fetch(`/api/v1/collections/${collection.id}`, {
      method: kind === "delete" ? "DELETE" : "PATCH",
      headers: { "content-type": "application/json" },
      body:
        kind === "rotate" ? JSON.stringify({ rotateLink: true }) : undefined,
    })
    if (!response.ok) {
      toast.error("Action failed")
      return
    }
    toast.success(
      kind === "rotate" ? "Collection link regenerated" : "Collection deleted"
    )
    setOpen(false)
    router.refresh()
  }
  const trigger = (
    <button className="w-full text-left">
      <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="p-6">
          <div className="mb-8 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <h2 className="font-heading text-xl font-semibold">
            {collection.name}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {collection.description || "No description"} ·{" "}
            {collection.visibility}
          </p>
        </CardContent>
      </Card>
    </button>
  )
  const content = (
    <div className="space-y-5">
      <form action={save} className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input
            name="name"
            defaultValue={collection.name}
            className="mt-2"
            required
          />
        </div>
        <div>
          <Label>Description</Label>
          <Input
            name="description"
            defaultValue={collection.description ?? ""}
            className="mt-2"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <IconSelect value={collection.icon} />
          <div>
            <Label>Visibility</Label>
            <Select name="visibility" defaultValue={collection.visibility}>
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
        </div>
        <p className="text-xs text-muted-foreground">
          Changing visibility revokes the existing collection link.
        </p>
        <Button type="submit" className="w-full">
          Save collection
        </Button>
      </form>
      <div className="grid grid-cols-2 gap-2">
        <NewShareOverlay initialCollectionId={collection.id} />
        <Button
          variant="outline"
          onClick={() =>
            navigator.clipboard
              .writeText(`${location.origin}/c/${collection.slug}`)
              .then(() => toast.success("Collection link copied"))
          }
        >
          <Copy />
          Copy link
        </Button>
        <Button variant="outline" onClick={() => action("rotate")}>
          <RotateCw />
          New link
        </Button>
        <Button variant="destructive" onClick={() => action("delete")}>
          <Trash2 />
          Delete
        </Button>
      </div>
      <div>
        <h3 className="mb-3 font-medium">Shares in this collection</h3>
        <ShareList shares={items} />
      </div>
    </div>
  )
  if (mobile)
    return (
      <Drawer open={open} onOpenChange={load} showSwipeHandle>
        <DrawerTrigger render={trigger} />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{collection.name}</DrawerTitle>
            <DrawerDescription>
              Customize, share, and manage this collection.
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto p-4 pb-8">{content}</div>
        </DrawerContent>
      </Drawer>
    )
  return (
    <Dialog open={open} onOpenChange={load}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{collection.name}</DialogTitle>
          <DialogDescription>
            Customize, share, and manage this collection.
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
function IconSelect({ value = "folder" }: { value?: string }) {
  return (
    <div>
      <Label>Icon</Label>
      <Select name="icon" defaultValue={value}>
        <SelectTrigger className="mt-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(icons).map((name) => (
            <SelectItem key={name} value={name}>
              {name[0].toUpperCase() + name.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
