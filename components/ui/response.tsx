"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ResponseProps {
  children: string
  className?: string
  isStreaming?: boolean
  onStreamComplete?: () => void
}

export function Response({ children, className, isStreaming = false, onStreamComplete }: ResponseProps) {
  const [displayedText, setDisplayedText] = useState("")

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(children)
      return
    }

    setDisplayedText("")
    let currentIndex = 0

    const streamInterval = setInterval(() => {
      if (currentIndex < children.length) {
        setDisplayedText(children.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        clearInterval(streamInterval)
        if (onStreamComplete) {
          onStreamComplete()
        }
      }
    }, 10)

    return () => clearInterval(streamInterval)
  }, [children, isStreaming, onStreamComplete])

  return (
    <div className={cn("whitespace-pre-wrap leading-relaxed font-medium text-foreground", className)}>
      {displayedText}
    </div>
  )
}
