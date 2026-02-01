"use client"

import { cn } from "@/lib/utils"
import React, { useEffect, useRef, useCallback } from "react"

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: {
  children?: React.ReactNode
  className?: string
  containerClassName?: string
  colors?: string[]
  waveWidth?: number
  backgroundFill?: string
  speed?: "slow" | "fast"
  waveOpacity?: number
  [key: string]: unknown
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const ntRef = useRef<number>(0)

  const waveColors = colors ?? [
    "#38bdf8",
    "#818cf8",
    "#c084fc",
    "#e879f9",
    "#22d3ee",
  ]

  const getSpeed = useCallback(() => {
    switch (speed) {
      case "slow":
        return 0.015
      case "fast":
        return 0.03
      default:
        return 0.02
    }
  }, [speed])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const setCanvasSize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    setCanvasSize()

    const w = () => canvas.getBoundingClientRect().width
    const h = () => canvas.getBoundingClientRect().height

    const drawWave = (time: number) => {
      const width = w()
      const height = h()

      // Clear canvas
      ctx.fillStyle = backgroundFill || "rgba(0, 0, 0, 1)"
      ctx.fillRect(0, 0, width, height)

      // Draw multiple wave layers
      for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        ctx.lineWidth = waveWidth || 50
        ctx.strokeStyle = waveColors[i % waveColors.length]
        ctx.globalAlpha = waveOpacity

        const yOffset = height * 0.5 + (i - 2) * 30

        for (let x = 0; x <= width; x += 3) {
          // Multiple sine waves for more organic movement
          const y =
            Math.sin(x * 0.008 + time + i * 0.5) * 40 +
            Math.sin(x * 0.012 + time * 1.5 + i * 0.3) * 30 +
            Math.sin(x * 0.005 + time * 0.8 + i * 0.7) * 25

          if (x === 0) {
            ctx.moveTo(x, yOffset + y)
          } else {
            ctx.lineTo(x, yOffset + y)
          }
        }

        ctx.stroke()
      }
    }

    const animate = () => {
      ntRef.current += getSpeed()
      drawWave(ntRef.current)
      animationRef.current = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      setCanvasSize()
    }

    window.addEventListener("resize", handleResize)
    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", handleResize)
    }
  }, [backgroundFill, waveOpacity, waveWidth, waveColors, getSpeed])

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        containerClassName
      )}
    >
      <canvas
        className="absolute inset-0 z-0 w-full h-full"
        ref={canvasRef}
      />
      <div className={cn("relative z-10", className)} {...props}>
        {children}
      </div>
    </div>
  )
}
