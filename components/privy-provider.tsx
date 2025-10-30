"use client"

import { PrivyProvider } from "@privy-io/react-auth"

export function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""
  
  // If no App ID is configured, render children without Privy
  // This allows the app to build and run without authentication
  if (!appId) {
    console.warn("NEXT_PUBLIC_PRIVY_APP_ID is not set. Authentication will not be available.")
    return <>{children}</>
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["google", "twitter"],
        appearance: {
          theme: "light",
          accentColor: "#10B981",
          logo: "/placeholder-logo.svg",
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </PrivyProvider>
  )
}

