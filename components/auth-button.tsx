"use client"

import { usePrivy } from "@privy-io/react-auth"
import { LogIn, LogOut, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function AuthButtonContent() {
  const { ready, authenticated, user, login, logout } = usePrivy()

  if (!ready) {
    return (
      <button 
        disabled 
        className="cursor-not-allowed flex items-center gap-2 bg-background border border-border rounded-lg px-3 h-10 text-sm font-medium opacity-50"
      >
        Loading...
      </button>
    )
  }

  if (!authenticated) {
    return (
      <button onClick={login} className="cursor-pointer flex items-center gap-2 bg-background hover:bg-muted border border-border rounded-lg transition-all px-3 h-10 text-sm font-medium">
        <LogIn className="h-4 w-4" />
        Sign In
      </button>
    )
  }

  const getDisplayName = () => {
    if (user?.google?.name) return user.google.name
    if (user?.twitter?.username) return `@${user.twitter.username}`
    if (user?.email?.address) return user.email.address
    return "User"
  }

  const getAvatarUrl = () => {
    // if (user?.google?.picture) return user.google.picture
    if (user?.twitter?.profilePictureUrl) return user.twitter.profilePictureUrl
    return undefined
  }

  const getInitials = () => {
    const name = getDisplayName()
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="cursor-pointer flex items-center gap-2 bg-background hover:bg-muted border border-border rounded-lg transition-all px-3 h-10 text-sm font-medium">
          {getAvatarUrl() ? (
            <img 
              src={getAvatarUrl()} 
              alt={getDisplayName()}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <User className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{getDisplayName()}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
            {user?.email?.address && (
              <p className="text-xs leading-none text-muted-foreground">{user.email.address}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AuthButton() {
  // Check if Privy is configured
  if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    return null
  }

  return <AuthButtonContent />
}

