"use client"

import { useEffect, useLayoutEffect, useState } from "react"

/**
 * Hook to handle mobile viewport specifics:
 * 1. Safe Area Insets (via CSS variables for JS access if needed, though env() usually works)
 * 2. 100vh fix for iOS Safari
 * 3. Orientation changes
 * 4. Dynamic viewport scaling factors
 */
export function useMobileViewport() {
  const [isMobile, setIsMobile] = useState(false)
  
  // Use useLayoutEffect to avoid FOUC for viewport height adjustments
  const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return

    const handleResize = () => {
      // 1. Fix 100vh on iOS
      // We set a custom variable --vh that represents 1% of the actual visible viewport height
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty("--vh", `${vh}px`)

      // 2. Check if mobile (basic check, can be refined)
      setIsMobile(window.innerWidth <= 768)
      
      // 3. Update Fluid Screen variable for JS-side calculations if needed
      // (CSS handles --fluid-screen = 100vw automatically, but sometimes window.innerWidth is more precise vs scrollbars)
      document.documentElement.style.setProperty("--fluid-screen", `${window.innerWidth}px`)
    }

    // Initial call
    handleResize()

    // Event listeners
    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleResize)
    }
  }, [])

  return {
    isMobile,
  }
}
