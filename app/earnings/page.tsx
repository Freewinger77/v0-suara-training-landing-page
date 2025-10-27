"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, ArrowLeft, DollarSign, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"

interface Submission {
  id: number
  originalText: string
  correctedText: string
  region?: string
  earnings: number
  submittedAt: Date
}

export default function EarningsPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail")
    if (!storedEmail) {
      router.push("/dashboard")
      return
    }

    setEmail(storedEmail)
    fetchEarningsData(storedEmail)
  }, [router])

  const fetchEarningsData = async (userEmail: string) => {
    try {
      // Fetch user data
      const userResponse = await fetch(`/api/users?email=${encodeURIComponent(userEmail)}`)
      if (userResponse.ok) {
        const user = await userResponse.json()
        setTotalEarnings(user.totalEarnings)
      }

      // Fetch submissions
      const submissionsResponse = await fetch(`/api/submissions?email=${encodeURIComponent(userEmail)}`)
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json()
        setSubmissions(submissionsData)
      }
    } catch (error) {
      console.error("Error fetching earnings data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/training" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <Mic className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Suara Training</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Your Earnings</h1>
            <p className="text-muted-foreground">Track your progress and earnings history</p>
          </div>

          {/* Earnings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-5 w-5" />
                <span className="text-sm">Total Earnings</span>
              </div>
              <div className="text-3xl font-bold text-secondary">RM {totalEarnings.toFixed(2)}</div>
            </Card>

            <Card className="p-6 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm">Total Submissions</span>
              </div>
              <div className="text-3xl font-bold text-primary">{submissions.length}</div>
            </Card>

            <Card className="p-6 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-5 w-5" />
                <span className="text-sm">Average per Day</span>
              </div>
              <div className="text-3xl font-bold text-foreground">
                {submissions.length > 0 ? Math.round(submissions.length / 7) : 0}
              </div>
            </Card>
          </div>

          {/* Submissions History */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Submission History</h2>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-muted-foreground">No submissions yet</p>
                <Link href="/training">
                  <Button>Start Training</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-primary">#{submission.id}</span>
                          {submission.region && (
                            <span className="text-xs bg-muted px-2 py-1 rounded">{submission.region}</span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-2">{submission.correctedText}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(submission.submittedAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-secondary">+RM {submission.earnings.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Link href="/training">
              <Button size="lg">Continue Training</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
