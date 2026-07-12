"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import {
  Archive,
  BookOpen,
  Boxes,
  Clock3,
  Command,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  Trash2,
  UserRound,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const nav = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["New share", "/new", Plus],
  ["Shares", "/shares", Archive],
  ["Collections", "/collections", Boxes],
  ["Recently viewed", "/recent", Clock3],
  ["Trash", "/trash", Trash2],
] as const
const secondary = [
  ["Settings", "/settings", Settings],
  ["Account", "/account", UserRound],
  ["Help & support", "/help", BookOpen],
] as const
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="hidden border-r bg-card/70 p-4 backdrop-blur lg:flex lg:flex-col">
        <Link
          href="/dashboard"
          className="px-3 py-2 font-heading text-xl font-semibold"
        >
          en<span className="text-primary">sage</span>
        </Link>
        <Button asChild className="mt-5 justify-start">
          <Link href="/new">
            <Plus />
            New share <kbd className="ml-auto text-[10px] opacity-70">N</kbd>
          </Link>
        </Button>
        <nav className="mt-5 space-y-1">
          {nav.map(([label, href, Icon]) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground",
                pathname === href && "bg-accent font-medium text-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-1">
          {secondary.map(([label, href, Icon]) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground",
                pathname === href && "bg-accent text-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/85 px-5 backdrop-blur">
          <Link
            href="/dashboard"
            className="font-heading text-lg font-semibold lg:hidden"
          >
            ensage
          </Link>
          <form action="/shares" className="relative mx-auto w-full max-w-xl">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Search shares, content, and collections…"
              className="pr-14 pl-9"
            />
            <kbd className="absolute top-2.5 right-3 text-xs text-muted-foreground">
              ⌘ K
            </kbd>
          </form>
          <Button variant="ghost" size="icon">
            <Command />
          </Button>
          <UserButton />
        </header>
        <div className="mx-auto max-w-7xl p-5 sm:p-8">{children}</div>
      </div>
    </div>
  )
}
