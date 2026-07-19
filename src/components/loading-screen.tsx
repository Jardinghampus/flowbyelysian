"use client"

import { PulsingBorder } from '@paper-design/shaders-react'
import { Logo } from '@/components/logo'

interface LoadingScreenProps {
  message?: string
  showLogo?: boolean
}

export function LoadingScreen({ message = "Loading...", showLogo = true }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative flex flex-col items-center justify-center">
        {/* Pulsing Border Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <PulsingBorder
            speed={1.24}
            roundness={1}
            thickness={0.08}
            softness={0.75}
            intensity={0.42}
            bloom={0.45}
            spots={3}
            spotSize={0.4}
            pulse={0.57}
            smoke={1}
            smokeSize={0}
            scale={0.8}
            rotation={0}
            aspectRatio="square"
            colors={['#0DC1FD', '#D915EF', '#FF3F2ECC']}
            colorBack="#00000000"
            style={{
              width: '300px',
              height: '300px',
            }}
          />
        </div>

        {/* Logo and Message */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          {showLogo && <Logo size={56} tone="hero" />}
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-xl font-semibold text-white">{message}</h2>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Compact loader for inline use
export function CompactLoader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimensions = {
    sm: { width: '80px', height: '80px' },
    md: { width: '150px', height: '150px' },
    lg: { width: '250px', height: '250px' },
  }

  return (
    <div className="flex items-center justify-center">
      <PulsingBorder
        speed={1.5}
        roundness={1}
        thickness={0.1}
        softness={0.75}
        intensity={0.5}
        bloom={0.5}
        spots={3}
        spotSize={0.4}
        pulse={0.6}
        smoke={1}
        smokeSize={0}
        scale={0.9}
        rotation={0}
        aspectRatio="square"
        colors={['#0DC1FD', '#D915EF', '#FF3F2ECC']}
        colorBack="#00000000"
        style={{
          ...dimensions[size],
          background: 'transparent',
        }}
      />
    </div>
  )
}
