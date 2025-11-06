"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea"
import { Response } from "@/components/ui/response"
import { Check, Loader2, Edit2, Pencil, Wallet, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AudioRecorder } from "@/components/audio-recorder"
import { HistoryModal } from "@/components/history-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthButton } from "@/components/auth-button"
import { StepIndicator } from "@/components/step-indicator"
import { usePrivy } from "@privy-io/react-auth"
import type { TrainingSubmission } from "@/lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Type for stored submissions (compatible with HistoryModal)
type StoredSubmission = {
  id: string
  timestamp: number
  originalText: string
  correctedText: string
  audioData: string | null
  region: string
  earnings: number
}

export default function TrainingPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { ready, authenticated, user } = usePrivy()
  const [userId, setUserId] = useState<string | null>(null)
  const [region, setRegion] = useState<string | null>(null)
  const [showRegionSelector, setShowRegionSelector] = useState(false)
  const [originalText, setOriginalText] = useState("")
  const [correctedText, setCorrectedText] = useState("")
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [currentStoryId, setCurrentStoryId] = useState<number | null>(null)
  const [currentStoryTitle, setCurrentStoryTitle] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [step, setStep] = useState<"original" | "correction" | "audio">("original")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [submissions, setSubmissions] = useState<StoredSubmission[]>([])
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [countdown, setCountdown] = useState(5)

  // Check authentication status
  useEffect(() => {
    if (ready && !authenticated) {
      setShowLogoutDialog(true)
    }
  }, [ready, authenticated])

  // Countdown and redirect when logged out
  useEffect(() => {
    if (showLogoutDialog) {
      if (countdown > 0) {
        const timer = setTimeout(() => {
          setCountdown(countdown - 1)
        }, 1000)
        return () => clearTimeout(timer)
      } else {
        router.push("/")
      }
    }
  }, [showLogoutDialog, countdown, router])

  // Initialize user and load data
  useEffect(() => {
    const initializeUser = async () => {
      const storedRegion = localStorage.getItem("selectedRegion")

      if (!storedRegion) {
        router.push("/")
        return
      }

      setRegion(storedRegion)

      // Get or create user if authenticated
      if (ready && authenticated && user) {
        try {
          // Get email from various sources
          const email = user.email?.address || user.twitter?.username || user.google?.email || user.id
          const displayName = user.twitter?.username || user.google?.name || email
          
          console.log('👤 Creating/fetching user...', {
            email,
            displayName,
            privyId: user.id,
            region: storedRegion,
            hasTwitter: !!user.twitter,
            hasGoogle: !!user.google,
            hasEmail: !!user.email
          })

          const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              privyId: user.id,
              region: storedRegion,
            }),
          })

          console.log('📡 User API Response Status:', response.status)

          if (response.ok) {
            const userData = await response.json()
            console.log('✅ User data loaded:', userData)
            setUserId(userData.id)
            await loadSubmissions(userData.id)
          } else {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
            console.error('❌ User API Error:', errorData)
          }
        } catch (error) {
          console.error('❌ Error initializing user:', error)
        }
      } else {
        console.log('⏳ Waiting for authentication...', { ready, authenticated, hasUser: !!user })
      }

      loadNextText()
    }

    initializeUser()
  }, [router, ready, authenticated, user])

  // Load submissions from Supabase
  const loadSubmissions = async (userIdToLoad: string) => {
    try {
      const response = await fetch(`/api/submissions?userId=${userIdToLoad}`)
      if (response.ok) {
        const data = await response.json()
        
        // Convert API submissions to StoredSubmission format for HistoryModal
        const formattedSubmissions: StoredSubmission[] = data.submissions.map((sub: TrainingSubmission) => ({
          id: sub.id,
          timestamp: new Date(sub.submitted_at).getTime(),
          originalText: sub.original_text,
          correctedText: sub.corrected_text,
          audioData: sub.audio_url || null,
          region: sub.region || '',
          earnings: Number(sub.earnings),
        }))
        
        setSubmissions(formattedSubmissions)
        setTotalEarnings(Number(data.totalEarnings))
      }
    } catch (error) {
      console.error('Error loading submissions:', error)
    }
  }

  const handleRegionSelect = (selectedRegion: string) => {
    setRegion(selectedRegion)
    localStorage.setItem("selectedRegion", selectedRegion)
    setShowRegionSelector(false)
    if (userId) {
      loadSubmissions(userId)
    }
    loadNextText()
  }

  const handleChangeRegion = () => {
    router.push("/")
  }

  const loadNextText = async () => {
    setIsStreaming(true)
    setOriginalText("")
    setCorrectedText("")
    setAudioBlob(null)
    setCurrentStoryId(null)
    setCurrentStoryTitle("")
    setStep("original")

    try {
      // Pass userId if available to get the next story in sequence
      const url = userId 
        ? `/api/training/next?userId=${userId}`
        : "/api/training/next"
      
      const response = await fetch(url)
      const data = await response.json()

      // Check if user has completed all stories
      if (data.completed) {
        toast({
          title: "Congratulations!",
          description: data.message || "You have completed all available stories!",
        })
        setIsStreaming(false)
        return
      }

      if (data.error) {
        throw new Error(data.error)
      }

      const text = data.text
      if (!text) {
        throw new Error("No text received")
      }

      // Capture story metadata
      setCurrentStoryId(data.storyId)
      setCurrentStoryTitle(data.title || "")
      setOriginalText(text)
      setCorrectedText(text)
      
      console.log('📖 Loaded story:', {
        storyId: data.storyId,
        title: data.title,
        currentStory: data.currentStory,
        totalStories: data.totalStories
      })
    } catch (error) {
      setIsStreaming(false)
      toast({
        variant: "destructive",
        title: "Error loading text",
        description: error instanceof Error ? error.message : "Please try again",
      })
    }
  }

  const handleStreamComplete = () => {
    setIsStreaming(false)
    setTimeout(() => {
      setStep("correction")
    }, 300)
  }

  const handleSubmitCorrection = async () => {
    if (!correctedText.trim() || isLoading) return
    setStep("audio")
  }

  const handleEdit = () => {
    setStep("correction")
    setAudioBlob(null)
  }

  const handleFinalSubmit = async () => {
    setIsLoading(true)

    try {
      // Convert audio blob to base64 data URL
      let audioData = ""
      if (audioBlob) {
        const reader = new FileReader()
        audioData = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(audioBlob)
        })
      }

      // Submit to API if user is authenticated, otherwise save to localStorage
      if (userId) {
        console.log('🚀 Submitting to Supabase...', {
          userId,
          storyId: currentStoryId,
          storyTitle: currentStoryTitle,
          originalText: originalText.substring(0, 50) + '...',
          correctedText: correctedText.substring(0, 50) + '...',
          hasAudio: !!audioData,
          region,
        })

        const response = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            storyId: currentStoryId,
            originalText,
            correctedText,
            audioData: audioData || null,
            region: region || "",
          }),
        })

        console.log('📡 API Response Status:', response.status)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          console.error('❌ API Error:', errorData)
          throw new Error(`Failed to submit: ${errorData.error || response.statusText}`)
        }

        const result = await response.json()
        console.log('✅ Submission successful!', result)

        // Reload submissions
        await loadSubmissions(userId)
      } else {
        // Fallback to localStorage if not authenticated
        const earnings = 0.1
        const newSubmission: StoredSubmission = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          originalText,
          correctedText,
          audioData: audioData || null,
          region: region || "",
          earnings,
        }
        
        const updatedSubmissions = [newSubmission, ...submissions].slice(0, 10)
        setSubmissions(updatedSubmissions)
        setTotalEarnings(totalEarnings + earnings)
      }

      toast({
        title: "Submission successful!",
        description: "You earned 10 Points",
      })

      setIsTransitioning(true)

      // Wait for transition animation then load next text
      setTimeout(() => {
        loadNextText()
        setIsLoading(false)
        setTimeout(() => {
          setIsTransitioning(false)
        }, 100)
      }, 500)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again",
      })
      setIsLoading(false)
    }
  }

  const refreshSubmissions = () => {
    if (userId) {
      loadSubmissions(userId)
    }
  }

  return (
    <>
      {/* Logout Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <DialogTitle className="text-xl">Oh No! Error</DialogTitle>
            </div>
            <DialogDescription className="text-base space-y-3">
              <p>Please login to continue training.</p>
              <p className="font-semibold text-foreground">
                You will be redirected to the homepage in{" "}
                <span className="text-destructive text-lg">{countdown}</span> second{countdown !== 1 ? 's' : ''}...
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between">
          {/* Earnings Badge (non-interactive) - Left Side */}
          <div className="flex items-center gap-2 bg-muted shadow-md rounded-lg px-3 h-10">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">{totalEarnings*100} Points</span>
          </div>

          {/* Action Buttons - Right Side */}
          <div className="flex items-center gap-2">
            {/* Change Region Button */}
            <Button
              onClick={handleChangeRegion}
              variant="outline"
              size="sm"
              className="cursor-pointer flex items-center gap-2 h-10"
              title={`Change region (${region})`}
            >
              {region && (
                <img
                  src={`/images/flags/${region.toLowerCase().replace(/\s+/g, "-")}.png`}
                  alt={`${region} flag`}
                  className="w-6 h-4 object-cover rounded shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              )}
            </Button>

            <HistoryModal submissions={submissions} onDelete={refreshSubmissions} />

            <AuthButton />

            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main content centered */}
      <div className="max-w-3xl mx-auto">
        <div
          className={`space-y-8 transition-all duration-200 ease-in-out ${
            isTransitioning ? "opacity-0 -translate-x-full scale-95" : "opacity-100 translate-x-0 scale-100"
          }`}
        >
          <StepIndicator currentStep={step} />

          <div className="relative">
            <div
              className={`space-y-3 transition-all duration-200 ease-in-out ${
                step === "audio" ? "opacity-0 -translate-y-12 absolute inset-x-0" : "opacity-100 translate-y-0"
              }`}
            >
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg border border-border/50 w-fit">
                <svg
                  className="w-4 h-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">AI Reference Text</span>
              </div>
              <div className="bg-muted/40 rounded-lg px-4 md:px-5 py-3 border border-border/50">
                {originalText ? (
                  <Response
                    key={originalText}
                    isStreaming={isStreaming}
                    onStreamComplete={handleStreamComplete}
                    className="text-sm md:text-base text-muted-foreground leading-relaxed"
                  >
                    {originalText}
                  </Response>
                ) : (
                  <span className="text-muted-foreground italic text-sm md:text-base">
                    {isStreaming ? "Loading..." : "Loading text..."}
                  </span>
                )}
              </div>
            </div>

            <div
              className={`transition-all duration-200 ease-in-out ${
                step === "original" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              } ${
                step === "audio"
                  ? "-translate-y-[180px]"
                  : step === "correction"
                    ? "mt-8"
                    : ""
              }`}
            >
              <div className={`space-y-4 ${step === "audio" ? "space-y-3" : ""}`}>
                {step === "audio" ? (
                  <div className="bg-muted/40 rounded-lg border border-border/50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Your Text</span>
                      </div>
                      <button
                        onClick={handleEdit}
                        disabled={isLoading}
                        className="cursor-pointer flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-foreground bg-background hover:bg-muted border border-border rounded-lg transition-all hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit Text
                      </button>
                    </div>
                    <div className="px-4 md:px-5 py-3">
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        {correctedText}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-base md:text-lg font-semibold text-foreground">Edit Your Text</span>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground px-1">
                        Correct any errors and adjust the text to match your dialect
                      </p>
                    </div>
                    <AutoResizeTextarea
                      value={correctedText}
                      onChange={(e) => setCorrectedText(e.target.value)}
                      placeholder="Edit the text to correct any errors..."
                      className="bg-background border-2 border-primary text-base md:text-lg font-medium"
                      disabled={isStreaming || isLoading}
                    />
                  </>
                )}

                {step === "correction" && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleSubmitCorrection}
                      disabled={isStreaming || isLoading || !correctedText.trim()}
                      className="cursor-pointer px-8 py-3 text-sm md:text-base bg-primary hover:bg-primary/90 text-white rounded-lg border-0 hover:scale-102 transition-all duration-[400ms] font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5 shadow-lg shadow-primary/25"
                    >
                      <Pencil className="h-5 w-5" />
                      Apply Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {step === "audio" && (
              <div className="bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5 rounded-2xl border-2 border-primary/20 p-6 md:p-8 space-y-6 mt-8 shadow-lg shadow-primary/10">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <h3 className="text-sm md:text-base text-muted-foreground">
                      Record Your Voice
                    </h3>
                  </div>
                  <p className="text-lg md:text-xl font-bold text-foreground ">
                    Read the text above clearly in your natural dialect
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full border border-border">
                    <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-medium text-muted-foreground">Max: 30 seconds</span>
                  </div>
                </div>

                <div
                  className={`transition-all duration-200 ease-in-out ${
                    step === "audio" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12 h-0 overflow-hidden"
                  }`}
                >
                  <AudioRecorder
                    key={originalText}
                    onRecordingComplete={(blob) => setAudioBlob(blob)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
          </div>

          {step === "audio" && (
            <div className="flex justify-center mb-20">
              <button
                onClick={handleFinalSubmit}
                disabled={isLoading || !audioBlob}
                className="cursor-pointer px-8 py-3 text-sm md:text-base bg-primary hover:bg-primary/90 text-white rounded-lg border-0 hover:scale-102 transition-all duration-[400ms] font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5 shadow-lg shadow-primary/25"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    {audioBlob && <Check className="h-5 w-5" />}
                    Submit & Next
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
