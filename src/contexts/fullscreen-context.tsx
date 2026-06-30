"use client"

import React, { createContext, useContext } from "react"
import { useFullscreen } from "@/hooks/use-fullscreen"

interface FullscreenContextProps {
  isFullscreen: boolean
  toggleFullscreen: () => void
  enterFullscreen: () => void
  exitFullscreen: () => void
}

const FullscreenContext = createContext<FullscreenContextProps | undefined>(undefined)

export function FullscreenProvider({ children }: { children: React.ReactNode }) {
  const fullscreen = useFullscreen()

  return (
    <FullscreenContext.Provider value={fullscreen}>
      {children}
    </FullscreenContext.Provider>
  )
}

export function useFullscreenContext() {
  const context = useContext(FullscreenContext)
  if (!context) {
    throw new Error("useFullscreenContext must be used within a FullscreenProvider")
  }
  return context
}
