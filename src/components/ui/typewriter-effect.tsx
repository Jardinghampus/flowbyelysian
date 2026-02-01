"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface TypewriterEffectProps {
  words: {
    text: string
    className?: string
  }[]
  className?: string
  cursorClassName?: string
  speed?: number
}

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
  speed = 100,
}: TypewriterEffectProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const fullText = words.map((w) => w.text).join(" ")

  useEffect(() => {
    if (isPaused) {
      const pauseTimeout = setTimeout(() => {
        setIsPaused(false)
        if (currentCharIndex === fullText.length) {
          // Start deleting after pause
          setIsDeleting(true)
        }
      }, 2000)
      return () => clearTimeout(pauseTimeout)
    }

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing
          if (currentCharIndex < fullText.length) {
            setCurrentCharIndex((prev) => prev + 1)
          } else {
            setIsPaused(true)
          }
        } else {
          // Deleting
          if (currentCharIndex > 0) {
            setCurrentCharIndex((prev) => prev - 1)
          } else {
            setIsDeleting(false)
            setIsPaused(true)
          }
        }
      },
      isDeleting ? speed / 2 : speed
    )

    return () => clearTimeout(timeout)
  }, [currentCharIndex, isDeleting, isPaused, fullText.length, speed])

  const displayedText = fullText.slice(0, currentCharIndex)

  // Calculate which word we're in
  let charCount = 0
  const renderWords = words.map((word, wordIndex) => {
    const wordStart = charCount
    const wordEnd = charCount + word.text.length
    charCount = wordEnd + 1 // +1 for space

    const visiblePart = displayedText.slice(
      wordStart,
      Math.min(wordEnd, displayedText.length)
    )

    if (wordStart >= displayedText.length) {
      return null
    }

    return (
      <span key={wordIndex} className={word.className}>
        {visiblePart}
        {wordIndex < words.length - 1 && displayedText.length > wordEnd && " "}
      </span>
    )
  })

  return (
    <div className={cn("inline-flex items-center", className)}>
      <span>{renderWords}</span>
      <span
        className={cn(
          "inline-block w-[4px] h-[1em] ml-1 bg-current animate-pulse",
          cursorClassName
        )}
      />
    </div>
  )
}

// Simpler single-line typewriter
interface SimpleTypewriterProps {
  text: string
  className?: string
  speed?: number
  delay?: number
}

export const SimpleTypewriter = ({
  text,
  className,
  speed = 80,
  delay = 0,
}: SimpleTypewriterProps) => {
  const [displayedText, setDisplayedText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [started, setStarted] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const delayTimeout = setTimeout(() => {
      setStarted(true)
    }, delay)
    return () => clearTimeout(delayTimeout)
  }, [delay])

  useEffect(() => {
    if (!started) return

    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1))
      }, speed)
      return () => clearTimeout(timeout)
    } else {
      // Hide cursor completely after typing is complete
      const cursorTimeout = setTimeout(() => {
        setIsComplete(true)
        setShowCursor(false)
      }, 800)
      return () => clearTimeout(cursorTimeout)
    }
  }, [displayedText, text, speed, started])

  // Cursor blink effect only while typing
  useEffect(() => {
    if (isComplete) return
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 530)
    return () => clearInterval(interval)
  }, [isComplete])

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <span
          className={cn(
            "inline-block w-[3px] h-[1em] ml-1 bg-current transition-opacity",
            showCursor ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </span>
  )
}
