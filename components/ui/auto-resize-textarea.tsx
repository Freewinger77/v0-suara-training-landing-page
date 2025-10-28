"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const AutoResizeTextarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, value, onChange, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

    React.useEffect(() => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.style.height = "auto"
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }, [value])

    const handleRef = (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node
      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }

    return (
      <textarea
        className={cn(
          "flex w-full rounded-xl border border-border bg-background px-3 py-3 sm:px-4 sm:py-3 md:px-6 md:py-4 leading-relaxed placeholder:text-muted-foreground focus-visible:outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden text-base sm:text-lg md:text-xl leading-6 sm:leading-7 tracking-normal sm:tracking-wide md:tracking-wider font-medium",
          className,
        )}
        ref={handleRef}
        value={value}
        onChange={onChange}
        rows={1}
        {...props}
      />
    )
  },
)
AutoResizeTextarea.displayName = "AutoResizeTextarea"

export { AutoResizeTextarea }
