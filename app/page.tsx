import Link from "next/link"
import {
  ArrowRight,
  Check,
  Command,
  LockKeyhole,
  Server,
  Sparkles,
} from "lucide-react"
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen">
      <nav className="mx-auto flex h-16 max-w-6xl items-center px-6">
        <Link href="/" className="font-heading text-xl font-semibold">
          en<span className="text-primary">sage</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost">Sign in</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button>Start sharing</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Button asChild>
              <Link href="/dashboard">Open workspace</Link>
            </Button>
            <UserButton />
          </Show>
        </div>
      </nav>
      <section className="mx-auto grid max-w-6xl gap-16 px-6 py-24 lg:grid-cols-[1.05fr_.95fr] lg:py-32">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3 text-primary" />
            Built for fast, private sharing
          </div>
          <h1 className="font-heading text-5xl leading-[1.03] font-semibold tracking-tight sm:text-7xl">
            Share anything.
            <br />
            <span className="text-primary">Keep control.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            A complete self-hosted sharing workspace for text, files, and
            links—with collections, search, expiration, access control, and a
            CLI that works wherever you do.
          </p>
          <div className="mt-9 flex gap-3">
            <SignUpButton mode="modal">
              <Button size="lg">
                Create your workspace <ArrowRight />
              </Button>
            </SignUpButton>
            <Button size="lg" variant="outline" asChild>
              <Link href="/help">Explore the CLI</Link>
            </Button>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {[
              "PostgreSQL backed",
              "No Vercel dependency",
              "Owner-managed access",
            ].map((x) => (
              <span key={x} className="flex items-center gap-2">
                <Check className="size-4 text-primary" />
                {x}
              </span>
            ))}
          </div>
        </div>
        <div className="relative rounded-3xl border bg-card p-3 shadow-2xl shadow-primary/10">
          <div className="rounded-2xl border bg-background p-6">
            <div className="flex items-center gap-2 border-b pb-4 text-sm">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="font-medium">New share</span>
              <span className="ml-auto text-muted-foreground">⌘ Enter</span>
            </div>
            <pre className="my-8 overflow-hidden rounded-xl bg-zinc-950 p-5 font-mono text-sm leading-7 text-zinc-300">
              <code>
                <span className="text-emerald-400">$</span> git diff | ensage
                create --stdin{`\n\n`} ✓ shared securely{`\n`}{" "}
                https://share.example/s/moss-river-42{`\n`} manage token saved
                to keychain
              </code>
            </pre>
            <div className="grid grid-cols-3 gap-3">
              {[
                [LockKeyhole, "Private by design"],
                [Command, "CLI native"],
                [Server, "Yours to run"],
              ].map(([Icon, label]) => (
                <div
                  key={String(label)}
                  className="rounded-xl border p-3 text-xs text-muted-foreground"
                >
                  <Icon className="mb-3 size-4 text-primary" />
                  {String(label)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
