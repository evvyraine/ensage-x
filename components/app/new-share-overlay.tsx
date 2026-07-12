"use client"
import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { NewShareForm } from "./new-share-form"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
type Data = {
  collections: { id: string; name: string }[]
  defaults: {
    visibility: "private" | "unlisted" | "public"
    ttl: number | null
    maxUploadBytes: number
  }
}
export function NewShareOverlay({
  compact = false,
  initialCollectionId,
}: {
  compact?: boolean
  initialCollectionId?: string
}) {
  const mobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<Data>({
    collections: [],
    defaults: { visibility: "unlisted", ttl: null, maxUploadBytes: 104857600 },
  })
  useEffect(() => {
    if (!open) return
    Promise.all([
      fetch("/api/v1/collections").then((r) => r.json()),
      fetch("/api/v1/settings").then((r) => r.json()),
    ]).then(([c, s]) =>
      setData({
        collections: c.collections ?? [],
        defaults: {
          visibility: s.settings?.defaultVisibility ?? "unlisted",
          ttl: s.settings?.defaultTtlHours ?? null,
          maxUploadBytes: s.settings?.maxUploadBytes ?? 104857600,
        },
      })
    )
  }, [open])
  const trigger = compact ? (
    <button
      className="flex w-full min-w-0 flex-col items-center gap-1 text-[10px] font-medium text-primary"
      aria-label="New share"
    >
      <span className="grid size-12 -translate-y-3 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg">
        <Plus className="size-5" />
      </span>
      <span className="-mt-3">New</span>
    </button>
  ) : (
    <Button className="w-full justify-start">
      <Plus />
      New share <kbd className="ml-auto text-[10px] opacity-70">N</kbd>
    </Button>
  )
  const form = (
    <NewShareForm
      defaults={data.defaults}
      collections={data.collections}
      initialCollectionId={initialCollectionId}
      onCreated={() => setOpen(false)}
    />
  )
  if (mobile)
    return (
      <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
        <DrawerTrigger render={trigger} />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>New share</DrawerTitle>
            <DrawerDescription>
              Create a secure link without leaving this page.
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto p-4 pb-8">{form}</div>
        </DrawerContent>
      </Drawer>
    )
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger} />
      <PopoverContent
        side="right"
        align="start"
        className="max-h-[85vh] w-[min(580px,calc(100vw-280px))] overflow-y-auto p-5"
      >
        <PopoverHeader>
          <PopoverTitle>New share</PopoverTitle>
          <PopoverDescription>
            Create a secure link without leaving this page.
          </PopoverDescription>
        </PopoverHeader>
        {form}
      </PopoverContent>
    </Popover>
  )
}
