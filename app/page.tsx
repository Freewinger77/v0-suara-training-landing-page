"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RegionSelector } from "@/components/region-selector"
import { HibiscusTransition } from "@/components/hibiscus-transition"
import { FlagSwipeTransition } from "@/components/flag-swipe-transition"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  const router = useRouter()
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
    return <HibiscusTransition onComplete={handleLandingAnimationComplete} duration={1.5} />
  }

  if (showTransition && selectedRegion) {
    return <FlagSwipeTransition region={selectedRegion} onComplete={handleTransitionComplete} />
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
        <ThemeToggle />
      </div>
      <RegionSelector onSelectRegion={handleRegionSelect} />
    </div>
  )
}
