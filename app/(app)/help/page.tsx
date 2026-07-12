import { BookOpen, Command, LifeBuoy, ShieldCheck } from "lucide-react"
import { PageHeading } from "@/components/app/page-heading"
import { Card, CardContent } from "@/components/ui/card"
const cards = [
  [
    Command,
    "CLI quickstart",
    "npm link, then pipe anything into `ensage create --stdin`. Create an API key in Settings first.",
  ],
  [
    ShieldCheck,
    "Security model",
    "Viewer passwords and creator management credentials are separate. API keys are shown once and stored hashed.",
  ],
  [
    BookOpen,
    "Self-hosting",
    "Run PostgreSQL, migrate the schema, configure Clerk, then start the standalone Next.js server with PM2.",
  ],
  [
    LifeBuoy,
    "Support",
    "Review audit events and health checks before opening an issue. Never include credentials in reports.",
  ],
]
export default function Help() {
  return (
    <>
      <PageHeading
        title="Help & support"
        description="Everything you need to share confidently."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map(([Icon, title, body]) => (
          <Card key={String(title)}>
            <CardContent className="p-6">
              <Icon className="mb-5 size-5 text-primary" />
              <h2 className="font-heading text-xl font-semibold">
                {String(title)}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {String(body)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
