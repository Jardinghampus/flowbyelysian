"use client"

import { cn } from "@/lib/utils"
import React, { useEffect, useRef } from "react"

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
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
  blur?: number
  speed?: "slow" | "fast"
  waveOpacity?: number
  [key: string]: unknown
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const getSpeed = () => {
    switch (speed) {
      case "slow":
        return 0.001
      case "fast":
        return 0.002
      default:
        return 0.001
    }
  }

  const waveColors = colors ?? [
    "#38bdf8",
    "#818cf8",
    "#c084fc",
    "#e879f9",
    "#22d3ee",
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = canvas.width = canvas.offsetWidth
    let h = canvas.height = canvas.offsetHeight
    let nt = 0
    let animationId: number

    ctx.filter = `blur(${blur}px)`

    const handleResize = () => {
      if (!ctx || !canvas) return
      w = ctx.canvas.width = canvas.offsetWidth
      h = ctx.canvas.height = canvas.offsetHeight
      ctx.filter = `blur(${blur}px)`
    }

    window.addEventListener("resize", handleResize)

    // Simple noise function using sine waves
    const noise = (x: number, y: number, t: number) => {
      return Math.sin(x * 0.01 + t) * Math.cos(y * 0.01 + t) * 0.5 +
             Math.sin(x * 0.02 - t * 0.5) * 0.3 +
             Math.cos(y * 0.015 + t * 0.8) * 0.2
    }

    const drawWave = (n: number) => {
      if (!ctx) return
      for (let i = 0; i < n; i++) {
        ctx.beginPath()
        ctx.lineWidth = waveWidth || 50
        ctx.strokeStyle = waveColors[i % waveColors.length]
        for (let x = 0; x < w; x += 5) {
          const y = noise(x, i * 100, nt) * 100
          ctx.lineTo(x, y + h * 0.5)
        }
        ctx.stroke()
        ctx.closePath()
      }
    }

    const render = () => {
      if (!ctx) return
      nt += getSpeed()
      ctx.fillStyle = backgroundFill || "rgba(0, 0, 0, 1)"
      ctx.globalAlpha = waveOpacity || 0.5
      ctx.fillRect(0, 0, w, h)
      drawWave(5)
      animationId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", handleResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blur, backgroundFill, waveOpacity, speed, waveWidth])

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
