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
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        smootherRef.current = ScrollSmoother.create({
          wrapper: wrapperRef.current,
          content: contentRef.current,
          smooth: 1.2, // Butter-smooth scrolling (1-2 seconds is ideal)
          effects: true, // Enable data-speed and data-lag attributes
          smoothTouch: 0.1, // Light smoothing on touch devices
          normalizeScroll: true, // Prevents address bar issues on mobile
          ignoreMobileResize: true, // Prevents jumping on mobile resize
        })

        // Refresh ScrollTrigger after smoother is created
        ScrollTrigger.refresh()
      })

      return () => {
        ctx.revert()
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      smootherRef.current?.kill()
    }
  }, [])

  return (
    <div
      id="smooth-wrapper"
      ref={wrapperRef}
      style={{
        overflow: "hidden",
        position: "fixed",
        height: "100%",
        width: "100%",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div
        id="smooth-content"
        ref={contentRef}
        style={{
          overflow: "visible",
          width: "100%",
          willChange: "transform",
        }}
      >
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

export function ParallaxImage({ src, alt, className = "" }: ParallaxImageProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        data-speed="auto"
        className="w-full h-full object-cover"
        style={{ willChange: "transform" }}
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
    <div data-lag={lag} className={className} style={{ willChange: "transform" }}>
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
    <div data-speed={speed} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  )
}
