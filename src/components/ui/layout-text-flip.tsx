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
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)

  useEffect(() => {
    if (texts.length <= 1) return

    const interval = setInterval(() => {
      setIsFlipping(true)

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % texts.length)
        setIsFlipping(false)
      }, 300) // Half of the flip animation duration
    }, duration)

    return () => clearInterval(interval)
  }, [texts.length, duration])

  return (
    <span
      className={cn(
        "inline-block transition-all duration-300 ease-in-out",
        isFlipping && "opacity-0 translate-y-2 scale-95",
        !isFlipping && "opacity-100 translate-y-0 scale-100",
        className
      )}
    >
      {texts[currentIndex]}
    </span>
  )
}
