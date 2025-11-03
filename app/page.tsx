"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RegionSelector } from "@/components/region-selector"
import { HibiscusTransition } from "@/components/hibiscus-transition"
import { FlagSwipeTransition } from "@/components/flag-swipe-transition"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthButton } from "@/components/auth-button"
import { usePrivy } from "@privy-io/react-auth"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const router = useRouter()
  const { ready, authenticated } = usePrivy()
  const { toast } = useToast()
  const [showTransition, setShowTransition] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [showLandingAnimation, setShowLandingAnimation] = useState<boolean | null>(null)

  useEffect(() => {
    const hasSeenAnimation = sessionStorage.getItem("hasSeenLandingAnimation")
    setShowLandingAnimation(!hasSeenAnimation)
  }, [])

  const handleLandingAnimationComplete = () => {
    sessionStorage.setItem("hasSeenLandingAnimation", "true")
    setShowLandingAnimation(false)
  }

  const handleRegionSelect = (region: string) => {
    // Check if user is authenticated
    if (!ready || !authenticated) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please login to proceed",
      })
      return
    }

    setSelectedRegion(region)
    localStorage.setItem("selectedRegion", region)
    setShowTransition(true)
  }

  const handleTransitionComplete = () => {
    router.push("/training")
  }

  if (showLandingAnimation === null) {
    return null // or a loading state
  }

  if (showLandingAnimation) {
    return <HibiscusTransition onComplete={handleLandingAnimationComplete} duration={1} />
  }

  if (showTransition && selectedRegion) {
    return <FlagSwipeTransition region={selectedRegion} onComplete={handleTransitionComplete} />
  }

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10 flex items-center gap-2">
        <img src="/images/logo/placeholder-logo-side.png" alt="logo" className="h-10 rounded-lg" />
      </div>
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10 flex items-center gap-2">
        <AuthButton />
        <ThemeToggle />
      </div>
      <RegionSelector onSelectRegion={handleRegionSelect} />
    </div>
  )
}
