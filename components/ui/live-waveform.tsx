"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface LiveWaveformProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  processing?: boolean
  barWidth?: number
  barGap?: number
  barRadius?: number
  barColor?: string
  fadeEdges?: boolean
  fadeWidth?: number
  height?: string | number
  sensitivity?: number
  smoothingTimeConstant?: number
  fftSize?: number
  historySize?: number
  updateRate?: number
  mode?: "scrolling" | "static"
  onError?: (error: Error) => void
  onStreamReady?: (stream: MediaStream) => void
  onStreamEnd?: () => void
}

export function LiveWaveform({
  active = false,
  processing = false,
  barWidth = 3,
  barGap = 1,
  barRadius = 1.5,
  barColor,
  fadeEdges = true,
  fadeWidth = 24,
  height = 64,
  sensitivity = 1,
  smoothingTimeConstant = 0.8,
  fftSize = 256,
  historySize = 60,
  updateRate = 30,
  mode = "static",
  onError,
  onStreamReady,
  onStreamEnd,
  className,
  ...props
}: LiveWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const audioContextRef = useRef<AudioContext>()
  const analyserRef = useRef<AnalyserNode>()
  const streamRef = useRef<MediaStream>()
  const historyRef = useRef<number[]>([])
  const processingPhaseRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Setup HiDPI canvas
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    let lastUpdate = Date.now()

    const draw = () => {
      const now = Date.now()
      const elapsed = now - lastUpdate

      if (elapsed < updateRate) {
        animationRef.current = requestAnimationFrame(draw)
        return
      }

      lastUpdate = now

      ctx.clearRect(0, 0, rect.width, rect.height)

      const color = barColor || getComputedStyle(canvas).color || "#000000"

      if (processing && !active) {
        // Processing animation
        drawProcessingWave(ctx, rect.width, rect.height, color)
      } else if (active && analyserRef.current) {
        // Active audio visualization
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)

        if (mode === "static") {
          drawStaticWaveform(ctx, dataArray, rect.width, rect.height, color)
        } else {
          drawScrollingWaveform(ctx, dataArray, rect.width, rect.height, color)
        }
      } else {
        // Idle state - draw flat line
        drawIdleState(ctx, rect.width, rect.height, color)
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    const drawProcessingWave = (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
      processingPhaseRef.current += 0.05
      const centerY = height / 2
      const numBars = Math.floor(width / (barWidth + barGap))

      for (let i = 0; i < numBars; i++) {
        const x = i * (barWidth + barGap)
        const wave = Math.sin(processingPhaseRef.current + i * 0.3) * 0.5 + 0.5
        const barHeight = wave * height * 0.3

        ctx.fillStyle = color
        ctx.beginPath()
        ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, barRadius)
        ctx.fill()
      }

      if (fadeEdges) {
        applyFadeEffect(ctx, width, height)
      }
    }

    const drawStaticWaveform = (
      ctx: CanvasRenderingContext2D,
      dataArray: Uint8Array,
      width: number,
      height: number,
      color: string,
    ) => {
      const centerY = height / 2
      const numBars = Math.floor(width / (barWidth + barGap))
      const step = Math.floor(dataArray.length / numBars)

      for (let i = 0; i < numBars; i++) {
        const x = i * (barWidth + barGap)
        const value = dataArray[i * step] / 255
        const barHeight = value * height * sensitivity

        ctx.fillStyle = color
        ctx.beginPath()
        ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, barRadius)
        ctx.fill()
      }

      if (fadeEdges) {
        applyFadeEffect(ctx, width, height)
      }
    }

    const drawScrollingWaveform = (
      ctx: CanvasRenderingContext2D,
      dataArray: Uint8Array,
      width: number,
      height: number,
      color: string,
    ) => {
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
      const normalizedValue = average / 255

      historyRef.current.push(normalizedValue)
      if (historyRef.current.length > historySize) {
        historyRef.current.shift()
      }

      const numBars = historyRef.current.length
      const barWidthWithGap = barWidth + barGap
      const centerY = height / 2

      historyRef.current.forEach((value, i) => {
        const x = i * barWidthWithGap
        const barHeight = Math.max(2, value * height * sensitivity)

        ctx.fillStyle = color
        ctx.beginPath()
        ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, barRadius)
        ctx.fill()
      })

      if (fadeEdges) {
        applyFadeEffect(ctx, width, height)
      }
    }

    const drawIdleState = (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
      const centerY = height / 2
      const numBars = Math.floor(width / (barWidth + barGap))

      for (let i = 0; i < numBars; i++) {
        const x = i * (barWidth + barGap)
        const barHeight = 2

        ctx.fillStyle = color
        ctx.globalAlpha = 0.2
        ctx.beginPath()
        ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, barRadius)
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }

    const applyFadeEffect = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Left fade
      const leftGradient = ctx.createLinearGradient(0, 0, fadeWidth, 0)
      leftGradient.addColorStop(0, "rgba(255, 255, 255, 1)")
      leftGradient.addColorStop(1, "rgba(255, 255, 255, 0)")
      ctx.globalCompositeOperation = "destination-out"
      ctx.fillStyle = leftGradient
      ctx.fillRect(0, 0, fadeWidth, height)

      // Right fade
      const rightGradient = ctx.createLinearGradient(width - fadeWidth, 0, width, 0)
      rightGradient.addColorStop(0, "rgba(255, 255, 255, 0)")
      rightGradient.addColorStop(1, "rgba(255, 255, 255, 1)")
      ctx.fillStyle = rightGradient
      ctx.fillRect(width - fadeWidth, 0, fadeWidth, height)

      ctx.globalCompositeOperation = "source-over"
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [
    active,
    processing,
    barWidth,
    barGap,
    barRadius,
    barColor,
    fadeEdges,
    fadeWidth,
    sensitivity,
    updateRate,
    mode,
    historySize,
  ])

  useEffect(() => {
    if (!active) {
      // Cleanup when not active
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = undefined
        onStreamEnd?.()
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
        audioContextRef.current = undefined
      }
      analyserRef.current = undefined
      historyRef.current = []
      return
    }

    // Setup audio context and microphone
    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream

        const audioContext = new AudioContext()
        audioContextRef.current = audioContext

        const analyser = audioContext.createAnalyser()
        analyser.fftSize = fftSize
        analyser.smoothingTimeConstant = smoothingTimeConstant
        analyserRef.current = analyser

        const source = audioContext.createMediaStreamSource(stream)
        source.connect(analyser)

        onStreamReady?.(stream)
      } catch (error) {
        onError?.(error as Error)
      }
    }

    setupAudio()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [active, fftSize, smoothingTimeConstant, onError, onStreamReady, onStreamEnd])

  return (
    <div className={cn("relative w-full", className)} {...props}>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: typeof height === "number" ? `${height}px` : height }}
      />
    </div>
  )
}
