"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, RotateCcw, Play, Pause } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LiveWaveform } from "@/components/ui/live-waveform"

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  disabled?: boolean
}

export function AudioRecorder({ onRecordingComplete, disabled }: AudioRecorderProps) {
  const { toast } = useToast()
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showWaveform, setShowWaveform] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const MAX_RECORDING_TIME = 30
  const STORAGE_KEY = "suara_audio_recording"

  useEffect(() => {
    localStorage.removeItem(STORAGE_KEY)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        resolve(base64.split(",")[1]) // Remove data:audio/webm;base64, prefix
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const base64ToBlob = (base64: string): Blob => {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: "audio/webm" })
  }

  const startRecording = async () => {
    try {
      setShowWaveform(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      })

      let mimeType = "audio/webm"
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm;codecs=opus"
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "audio/ogg;codecs=opus"
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = "audio/mp4"
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = "" // Use default
            }
          }
        }
      }

      const options = mimeType ? { mimeType } : {}
      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" })
        setAudioBlob(blob)
        onRecordingComplete(blob)

        try {
          const base64 = await blobToBase64(blob)
          localStorage.setItem(STORAGE_KEY, base64)
        } catch (error) {
          console.error("[v0] Error saving recording to localStorage:", error)
        }

        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(MAX_RECORDING_TIME)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev - 1
          if (newTime <= 0) {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
              mediaRecorderRef.current.stop()
              setIsRecording(false)
            }
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }
            return 0
          }
          return newTime
        })
      }, 1000)
    } catch (error) {
      console.error("[v0] Error starting recording:", error)
      setShowWaveform(false)
      toast({
        variant: "destructive",
        title: "Recording failed",
        description: error instanceof Error ? error.message : "Please allow microphone access",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const retryRecording = () => {
    setAudioBlob(null)
    setRecordingTime(0)
    setShowWaveform(false)
    setIsPlaying(false)
    localStorage.removeItem(STORAGE_KEY)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    startRecording()
  }

  const togglePlayback = () => {
    if (!audioBlob) return

    if (!audioRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob)
      audioRef.current = new Audio(audioUrl)
      audioRef.current.onended = () => setIsPlaying(false)
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const isLastFiveSeconds = recordingTime <= 5 && recordingTime > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center w-full">
        {!showWaveform && !audioBlob && (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="cursor-pointer group relative w-20 h-20 rounded-full bg-primary hover:bg-primary/50 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mic className="h-8 w-8 text-white hibiscus-text-fill" />
          </button>
        )}

        {showWaveform && !audioBlob && (
          <div className="relative flex flex-col items-center gap-4 w-full">
            {isRecording && (
              <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span
                  className={`transition-transform duration-300 ${isLastFiveSeconds ? "scale-[1.3]" : "scale-100"}`}
                >
                  {recordingTime}s
                </span>
              </div>
            )}

            <div className="w-full rounded-lg border border-border bg-card grid grid-cols-2">
              <div className="rotate-180 -mr-2">
                <LiveWaveform
                  active={isRecording}
                  processing={false}
                  mode="static"
                  height={80}
                  barWidth={5}
                  barGap={2}
                  barColor="teal"
                  sensitivity={0.80}
                  fadeEdges={true}
                  historySize={80}
                />
              </div>
              <div className="-ml-1">
                <LiveWaveform
                  active={isRecording}
                  processing={false}
                  mode="static"
                  height={80}
                  barWidth={5}
                  barGap={2}
                  barColor="teal"
                  sensitivity={0.80}
                  fadeEdges={true}
                  historySize={80}
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={stopRecording}
              className="cursor-pointer bg-white dark:bg-card border-border text-foreground hover:bg-gray-300 dark:hover:bg-gray-800 hover:scale-[1.02] transition-all duration-200"
            >
              Stop Recording
            </Button>
          </div>
        )}

        {audioBlob && (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={togglePlayback}
              className="cursor-pointer w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-300 flex items-center justify-center shadow-md"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 text-white" />
              ) : (
                <Play className="h-6 w-6 text-white ml-1" />
              )}
            </button>

            <button
              type="button"
              onClick={retryRecording}
              className="cursor-pointer group flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <RotateCcw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
