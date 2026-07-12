"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import {
  Archive,
  BookOpen,
  Boxes,
  Clock3,
  Home,
  LayoutDashboard,
  Search,
  Settings,
  Trash2,
  UserRound,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { NewShareOverlay } from "./new-share-overlay"
const nav = [
  ["Dashboard", "/dashboard", LayoutDashboard],
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
    <div className="min-h-screen pb-28 lg:grid lg:grid-cols-[250px_1fr] lg:pb-0">
      <aside className="hidden border-r bg-card/70 p-4 backdrop-blur lg:flex lg:flex-col">
        <Link
          href="/dashboard"
          className="px-3 py-2 font-heading text-xl font-semibold"
        >
          en<span className="text-primary">sage</span>
        </Link>
        <div className="mt-5">
          <NewShareOverlay />
        </div>
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
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur sm:px-5">
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
              placeholder="Search shares and collections…"
              className="pl-9"
            />
          </form>
          <UserButton />
        </header>
        <div className="mx-auto max-w-7xl p-4 sm:p-8">{children}</div>
      </div>
      <nav
        aria-label="Mobile navigation"
        className="mobile-tab-bar z-40 items-center rounded-2xl border bg-background/95 px-2 py-2 shadow-xl backdrop-blur"
        style={{
          position: "fixed",
          left: "12px",
          right: "12px",
          bottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          width: "auto",
        }}
      >
        <MobileLink
          href="/dashboard"
          label="Home"
          icon={Home}
          active={pathname === "/dashboard"}
        />
        <MobileLink
          href="/shares"
          label="Shares"
          icon={Archive}
          active={pathname.startsWith("/shares")}
        />
        <NewShareOverlay compact />
        <MobileLink
          href="/collections"
          label="Collections"
          icon={Boxes}
          active={pathname.startsWith("/collections")}
        />
        <MobileLink
          href="/settings"
          label="Settings"
          icon={Settings}
          active={pathname === "/settings"}
        />
      </nav>
    </div>
  )
}
function MobileLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: typeof Home
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-w-0 flex-col items-center gap-1 overflow-hidden py-1 text-[10px] font-medium text-muted-foreground",
        active && "text-primary"
      )}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  )
}
