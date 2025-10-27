"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    // Toggle between light and dark (skip system for simplicity)
    if (theme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center gap-2 h-10 px-1 rounded-full bg-muted border border-border transition-colors hover:bg-muted/80"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Sun icon */}
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
          !isDark ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground"
        }`}
      >
        <Sun className="h-4 w-4" />
      </div>

      {/* Moon icon */}
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
          isDark ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground"
        }`}
      >
        <Moon className="h-4 w-4" />
      </div>

      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
