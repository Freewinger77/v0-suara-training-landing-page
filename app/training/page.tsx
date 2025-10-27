"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea"
import { Response } from "@/components/ui/response"
import { Check, Loader2, Edit2, Pencil, Wallet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AudioRecorder } from "@/components/audio-recorder"
import { HistoryModal } from "@/components/history-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { saveSubmission, getSubmissions, getTotalEarnings, type StoredSubmission } from "@/lib/submission-storage"

export default function TrainingPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [region, setRegion] = useState<string | null>(null)
  const [showRegionSelector, setShowRegionSelector] = useState(false)
  const [originalText, setOriginalText] = useState("")
  const [correctedText, setCorrectedText] = useState("")
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [step, setStep] = useState<"original" | "correction" | "audio">("original")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [submissions, setSubmissions] = useState<StoredSubmission[]>([])
  const [totalEarnings, setTotalEarnings] = useState(0)

  useEffect(() => {
    const storedRegion = localStorage.getItem("selectedRegion")

    if (!storedRegion) {
      router.push("/")
      return
    }

    setRegion(storedRegion)
    setSubmissions(getSubmissions())
    setTotalEarnings(getTotalEarnings())
    loadNextText()
  }, [router])

  const handleRegionSelect = (selectedRegion: string) => {
    setRegion(selectedRegion)
    localStorage.setItem("selectedRegion", selectedRegion)
    setShowRegionSelector(false)
    setSubmissions(getSubmissions())
    setTotalEarnings(getTotalEarnings())
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
    setStep("original")

    try {
      const response = await fetch("/api/training/next")
      const data = await response.json()

      const text = data.text
      setOriginalText(text)
      setCorrectedText(text)
    } catch (error) {
      setIsStreaming(false)
      toast({
        variant: "destructive",
        title: "Error loading text",
        description: "Please try again",
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
      let audioData = ""
      if (audioBlob) {
        const reader = new FileReader()
        audioData = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(audioBlob)
        })
      }

      const earnings = 0.1
      saveSubmission({
        originalText,
        correctedText,
        audioData: audioData || null,
        region: region || "",
        earnings,
      })

      setSubmissions(getSubmissions())
      setTotalEarnings(getTotalEarnings())

      toast({
        title: "Submission successful!",
        description: "You earned RM 0.10",
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
    setSubmissions(getSubmissions())
    setTotalEarnings(getTotalEarnings())
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-3">
            <button
              onClick={handleChangeRegion}
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors"
              title={`Change region (${region})`}
            >
              {region && (
                <img
                  src={`/images/flags/${region.toLowerCase().replace(/\s+/g, "-")}.png`}
                  alt={`${region} flag`}
                  className="w-8 h-6 object-cover rounded shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              )}
              <Edit2 className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">RM {totalEarnings.toFixed(2)}</span>
            </div>

            <HistoryModal submissions={submissions} onDelete={refreshSubmissions} />

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
          <div className="relative">
            <div
              className={`space-y-3 transition-all duration-200 ease-in-out ${
                step === "audio" ? "opacity-0 -translate-y-12 absolute inset-x-0" : "opacity-100 translate-y-0"
              }`}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg
                  className="w-5 h-5"
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
                <span className="text-sm font-medium">AI Generated </span>
              </div>
              <div className="bg-muted rounded-xl px-4 md:px-6 py-4 border border-border">
                {originalText ? (
                  <Response
                    key={originalText}
                    isStreaming={isStreaming}
                    onStreamComplete={handleStreamComplete}
                    className="text-base md:text-lg lg:text-xl leading-6 md:leading-7 tracking-normal md:tracking-wide lg:tracking-wider"
                  >
                    {originalText}
                  </Response>
                ) : (
                  <span className="text-muted-foreground italic text-base md:text-lg lg:text-xl">
                    {isStreaming ? "Loading..." : "Loading text..."}
                  </span>
                )}
              </div>
            </div>

            <div
              className={`space-y-3 transition-all duration-200 ease-in-out ${
                step === "original" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              } ${
                step === "audio"
                  ? "shadow-[0_0_30px_rgba(59,130,246,0.3)] -translate-y-[180px]"
                  : step === "correction"
                    ? "mt-6"
                    : ""
              }`}
            >
              {step !== "audio" && (
                <div className="flex items-center gap-2 px-[5px] py-0.5">
                  <span className="text-sm font-medium">Your Correction</span>
                  <span className="text-xs md:text-sm text-muted-foreground">
                    Edit for your dialect & fix any errors
                  </span>
                </div>
              )}
              <AutoResizeTextarea
                value={correctedText}
                onChange={(e) => setCorrectedText(e.target.value)}
                placeholder="Edit the text to correct any errors..."
                className="bg-background border-border"
                disabled={isStreaming || isLoading || step === "audio"}
              />

              {step === "correction" && (
                <div className="flex justify-center pt-2 py-4">
                  <button
                    onClick={handleSubmitCorrection}
                    disabled={isStreaming || isLoading || !correctedText.trim()}
                    className="px-6 md:px-8 py-3 text-sm md:text-base bg-muted text-popover-foreground rounded-md border-0 hover:scale-105 transition-all duration-[400ms] font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Pencil className="h-4 w-4 md:h-5 md:w-5" />
                    Apply changes
                  </button>
                </div>
              )}
            </div>

            {step === "audio" && (
              <div
                className={`flex justify-center transition-all duration-200 ease-in-out ${
                  step === "audio" ? "opacity-100 translate-y-0 mt-6" : "opacity-0 translate-y-12"
                }`}
              >
                <button
                  onClick={handleEdit}
                  disabled={isLoading}
                  className="px-6 md:px-8 py-3 text-sm md:text-base bg-muted text-popover-foreground rounded-md border-0 hover:scale-105 transition-all duration-[400ms] font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4 md:h-5 md:w-5" />
                  Edit
                </button>
              </div>
            )}

            {step === "audio" && (
              <div className="text-center space-y-2 mt-8 mb-4">
                <p className="text-sm md:text-base font-medium text-foreground">
                  Now, record your voice sample by speaking the text above
                </p>
                <p className="text-xs text-muted-foreground">Max recording time: 30 seconds</p>
              </div>
            )}

            <div
              className={`transition-all duration-200 ease-in-out ${
                step === "audio" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12 h-0 overflow-hidden"
              }`}
            >
              {step === "audio" && (
                <AudioRecorder
                  key={originalText}
                  onRecordingComplete={(blob) => setAudioBlob(blob)}
                  disabled={isLoading}
                />
              )}
            </div>
          </div>

          {step === "audio" && (
            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={handleFinalSubmit}
                disabled={isLoading || !audioBlob}
                className="px-6 md:px-8 py-4 md:py-6 text-sm md:text-base bg-black hover:bg-gray-800 text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Submit & Next
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
