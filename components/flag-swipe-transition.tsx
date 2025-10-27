"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

interface FlagSwipeTransitionProps {
  region: string
  onComplete: () => void
}

export function FlagSwipeTransition({ region, onComplete }: FlagSwipeTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const flagRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        onComplete()
      },
    })

    // Swipe in from right to left
    tl.fromTo(
      flagRef.current,
      {
        x: "100vw",
        opacity: 0,
        scale: 0.8,
      },
      {
        x: "0",
        opacity: 1,
        scale: 1.2,
        duration: 0.6,
        ease: "power2.out",
      },
    )

    // Pause in the middle with a subtle pulse
    tl.to(flagRef.current, {
      scale: 1.3,
      duration: 0.3,
      ease: "sine.inOut",
    })

    tl.to(flagRef.current, {
      scale: 1.2,
      duration: 0.3,
      ease: "sine.inOut",
    })

    // Continue swiping left off-screen
    tl.to(
      flagRef.current,
      {
        x: "-100vw",
        opacity: 0,
        scale: 0.8,
        duration: 0.6,
        ease: "power2.in",
      },
      "+=0.2",
    )

    return () => {
      tl.kill()
    }
  }, [onComplete, region])

  const flagPath = `/images/flags/${region.toLowerCase().replace(/\s+/g, "-")}.png`

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background pointer-events-none"
    >
      <img
        ref={flagRef}
        src={flagPath || "/placeholder.svg"}
        alt={`${region} flag`}
        className="w-64 h-48 object-contain drop-shadow-2xl"
      />
    </div>
  )
}
