"use client"

import { Logo } from "@/components/logo"

export function Preloader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="absolute z-10 flex flex-col items-center gap-4 text-white text-center">
        <Logo size={56} tone="hero" />
        <div>
          <h1 className="text-4xl font-bold mb-2">Zaylo</h1>
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
      </div>
    </div>
  )
}
