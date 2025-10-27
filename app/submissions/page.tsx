"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, Volume2 } from "lucide-react"
import Link from "next/link"

interface Submission {
  id: number
  originalText: string
  correctedText: string
  audioUrl?: string
  region?: string
  earnings: number
  submittedAt: string
}

export default function SubmissionsPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState("")

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail")
    if (!storedEmail) {
      router.push("/")
      return
    }

    setEmail(storedEmail)
    fetchSubmissions(storedEmail)
  }, [router])

  const fetchSubmissions = async (userEmail: string) => {
    try {
      const response = await fetch(`/api/submissions?email=${encodeURIComponent(userEmail)}`)
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)
      }
    } catch (error) {
      console.error("Error fetching submissions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/training">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Training
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Submission History</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No submissions yet</p>
              <Link href="/training">
                <Button>Start Training</Button>
              </Link>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  Total: {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
                </p>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Total Earned: RM {(submissions.length * 0.1).toFixed(2)}
                </Badge>
              </div>

              {submissions.map((submission) => (
                <Card key={submission.id} className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{formatDate(submission.submittedAt)}</span>
                      </div>
                      {submission.region && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{submission.region}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary">+RM {submission.earnings.toFixed(2)}</Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Original</h4>
                      <p className="text-sm bg-muted/50 p-3 rounded-lg leading-relaxed">{submission.originalText}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Your Correction</h4>
                      <p className="text-sm bg-primary/5 p-3 rounded-lg leading-relaxed border border-primary/20">
                        {submission.correctedText}
                      </p>
                    </div>
                  </div>

                  {submission.audioUrl && (
                    <div className="flex items-center gap-2 pt-2">
                      <Volume2 className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Audio recording included</span>
                    </div>
                  )}
                </Card>
              ))}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
