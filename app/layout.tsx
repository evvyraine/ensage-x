import { ClerkProvider } from "@clerk/nextjs"
import { shadcn } from "@clerk/ui/themes"
import { Geist_Mono, Instrument_Sans, Lora } from "next/font/google"

import "./globals.css"
import "@clerk/ui/themes/shadcn.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"

const loraHeading = Lora({ subsets: ["latin"], variable: "--font-heading" })

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        instrumentSans.variable,
        loraHeading.variable
      )}
    >
      <body>
        <ClerkProvider appearance={{ theme: shadcn }}>
          <ThemeProvider>
            {children}
            <Toaster richColors />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}

export const metadata = {
  title: { default: "ensage", template: "%s · ensage" },
  description:
    "A secure, self-hosted workspace for sharing text, files, and links.",
}
