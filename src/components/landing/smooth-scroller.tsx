"use client"

import { useEffect, useRef, ReactNode } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollSmoother } from "gsap/ScrollSmoother"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother)
}

interface SmoothScrollerProps {
  children: ReactNode
}

export function SmoothScroller({ children }: SmoothScrollerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const smootherRef = useRef<ScrollSmoother | null>(null)

  useEffect(() => {
    // Create ScrollSmoother instance
    const ctx = gsap.context(() => {
      smootherRef.current = ScrollSmoother.create({
        wrapper: wrapperRef.current,
        content: contentRef.current,
        smooth: 1.5, // Smooth scrolling duration in seconds
        effects: true, // Enable data-speed and data-lag attributes
        smoothTouch: 0.1, // Light smoothing on touch devices
        normalizeScroll: true, // Prevents mobile address bar issues
        ignoreMobileResize: true, // Prevents jumping on mobile resize
      })
    })

    return () => {
      ctx.revert()
      smootherRef.current?.kill()
    }
  }, [])

  return (
    <div id="smooth-wrapper" ref={wrapperRef}>
      <div id="smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  )
}

// Parallax image component for easy usage
interface ParallaxImageProps {
  src: string
  alt: string
  speed?: number
  className?: string
}

export function ParallaxImage({ src, alt, speed = 0.5, className = "" }: ParallaxImageProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        data-speed="auto"
        className="w-full h-full object-cover"
      />
    </div>
  )
}

// Lag element wrapper for smooth catch-up effect
interface LagElementProps {
  children: ReactNode
  lag?: number
  className?: string
}

export function LagElement({ children, lag = 0.5, className = "" }: LagElementProps) {
  return (
    <div data-lag={lag} className={className}>
      {children}
    </div>
  )
}

// Speed element wrapper for parallax effect
interface SpeedElementProps {
  children: ReactNode
  speed?: number
  className?: string
}

export function SpeedElement({ children, speed = 0.5, className = "" }: SpeedElementProps) {
  return (
    <div data-speed={speed} className={className}>
      {children}
    </div>
  )
}
