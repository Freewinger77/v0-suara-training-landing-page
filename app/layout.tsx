import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Suara - The Best Speech Models for Malaysia",
  description:
    "By Malaysians, for Malaysians. Help improve speech-to-text AI by training models in your Malaysian dialect.",
  generator: "Suara",
  openGraph: {
    title: "Suara - The Best Speech Models for Malaysia",
    description:
      "By Malaysians, for Malaysians. Help improve speech-to-text AI by training models in your Malaysian dialect.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Suara - The Best Speech Models for Malaysia",
    description:
      "By Malaysians, for Malaysians. Help improve speech-to-text AI by training models in your Malaysian dialect.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider defaultTheme="system" storageKey="suara-theme">
          <Suspense fallback={<div>Loading...</div>}>
            {children}
            <Analytics />
          </Suspense>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
