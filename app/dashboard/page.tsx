"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MalaysiaMap } from "@/components/malaysia-map"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mic, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [hasEmail, setHasEmail] = useState(false)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    // Check if user email exists in localStorage
    const storedEmail = localStorage.getItem("userEmail")
    const storedRegion = localStorage.getItem("userRegion")

    if (storedEmail) {
      setEmail(storedEmail)
      setHasEmail(true)

      // If user already has a region, go directly to training
      if (storedRegion) {
        router.push("/training")
      } else {
        setShowMap(true)
      }
    }
  }, [router])

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      localStorage.setItem("userEmail", email)
      setHasEmail(true)
      setShowMap(true)
    }
  }

  const handleRegionSelect = async (region: string) => {
    localStorage.setItem("userRegion", region)

    // Create user in database
    try {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, region }),
      })
    } catch (error) {
      console.error("Error creating user:", error)
    }

    router.push("/training")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <Mic className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Suara Training</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {!hasEmail ? (
          <Card className="max-w-md mx-auto p-8">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Welcome!</h1>
                <p className="text-muted-foreground">Enter your email to get started and track your earnings</p>
              </div>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Continue
                </Button>
              </form>
            </div>
          </Card>
        ) : showMap ? (
          <MalaysiaMap onSelectRegion={handleRegionSelect} />
        ) : null}
      </main>
    </div>
  )
}
