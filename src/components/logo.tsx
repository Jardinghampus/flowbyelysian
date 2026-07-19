"use client"

import { LiquidMetal } from "@paper-design/shaders-react"
import { BRAND_LOGO_IMAGE } from "@/lib/brand"
import { cn } from "@/lib/utils"

/** Paper design aspect ratio (456×342). */
const LOGO_ASPECT = 456 / 342

export type LogoProps = {
  size?: number
  className?: string
  /** Square crop — fits sidebar / favicon-style slots. */
  square?: boolean
}

export function Logo({ size = 24, className, square = false }: LogoProps) {
  const height = size
  const width = square ? size : Math.round(size * LOGO_ASPECT)

  return (
    <div
      className={cn("relative shrink-0 overflow-hidden", className)}
      style={{ width, height }}
      role="img"
      aria-label="Zaylo"
    >
      <LiquidMetal
        speed={1}
        softness={0.1}
        repetition={2}
        shiftRed={0.3}
        shiftBlue={0.3}
        distortion={0.07}
        contour={0.4}
        scale={1.11}
        rotation={0}
        shape="diamond"
        angle={70}
        image={BRAND_LOGO_IMAGE}
        colorBack="#00000000"
        colorTint="#FFFFFF"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  )
}
