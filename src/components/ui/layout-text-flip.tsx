"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface LayoutTextFlipProps {
  texts: string[]
  className?: string
  duration?: number // Duration in ms for each text
}

export function LayoutTextFlip({
  texts,
  className,
  duration = 3000,
}: LayoutTextFlipProps) {
  const [mounted, setMounted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)

  // Prevent hydration mismatch - only start after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || texts.length <= 1) return

    const interval = setInterval(() => {
      setIsFlipping(true)

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % texts.length)
        setIsFlipping(false)
      }, 300)
    }, duration)

    return () => clearInterval(interval)
  }, [mounted, texts.length, duration])

  // Always render first text on server and until mounted
  const displayText = texts[currentIndex] || texts[0] || ""

  return (
    <span
      className={cn(
        "inline-block transition-all duration-300 ease-in-out",
        mounted && isFlipping && "opacity-0 translate-y-2 scale-95",
        (!mounted || !isFlipping) && "opacity-100 translate-y-0 scale-100",
        className
      )}
    >
      {displayText}
    </span>
  )
}
