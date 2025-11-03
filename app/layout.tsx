import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/components/privy-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Suara - The Best Speech Models for Malaysia",
  description:
    "By Malaysians, for Malaysians. Help improve speech-to-text AI by training models in your Malaysian dialect.",
  generator: "Suara",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
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
        <Providers>
          <ThemeProvider defaultTheme="system" storageKey="suara-theme">
            <Suspense fallback={<div>Loading...</div>}>
              {children}
              <Analytics />
            </Suspense>
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
