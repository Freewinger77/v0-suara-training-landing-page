"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

interface HibiscusTransitionProps {
  onComplete: () => void
  duration?: number
}

export function HibiscusTransition({ onComplete, duration = 2.5 }: HibiscusTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hibiscusRef = useRef<HTMLImageElement>(null)
  const onCompleteRef = useRef(onComplete)

  // Keep the ref up to date without triggering re-animation
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        onCompleteRef.current()
      },
    })

    if (duration < 1) {
      tl.fromTo(
        hibiscusRef.current,
        {
          scale: 0.8,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        },
      )

      tl.to(
        hibiscusRef.current,
        {
          y: -150,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
        },
        "-=0.1",
      )
    } else {
      // Float in with rotation
      tl.fromTo(
        hibiscusRef.current,
        {
          scale: 0,
          opacity: 0,
          y: 100,
          rotation: -45,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          rotation: 0,
          duration: 1.2,
          ease: "back.out(1.7)",
        },
      )

      // Breathing animation
      tl.to(hibiscusRef.current, {
        scale: 1.15,
        duration: 0.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: 3,
      })

      // Float away upwards and fade out
      tl.to(
        hibiscusRef.current,
        {
          y: -200,
          opacity: 0,
          scale: 0.8,
          rotation: 15,
          duration: 1,
          ease: "power2.in",
        },
        "-=0.2",
      )
    }

    return () => {
      tl.kill()
    }
  }, [duration])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background pointer-events-none"
    >
      <img
        ref={hibiscusRef}
        src="/images/hibiscus.png"
        alt="Hibiscus"
        className="w-64 h-64 object-contain drop-shadow-2xl"
      />
    </div>
  )
}
