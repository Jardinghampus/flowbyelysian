"use client"

import { LiquidMetal } from "@paper-design/shaders-react"
import { BRAND_LOGO_IMAGE } from "@/lib/brand"
import { cn } from "@/lib/utils"

export type LogoProps = {
  /** Outer box size in px (always square). */
  size?: number
  className?: string
  /** Calmer shader for chrome; bolder on splash / auth hero. */
  tone?: "ui" | "hero"
}

function shaderSettings(size: number, tone: "ui" | "hero") {
  const compact = size <= 44
  const ui = tone === "ui" || compact

  return {
    speed: ui ? 0.5 : 0.85,
    softness: ui ? 0.28 : 0.14,
    repetition: ui ? 1 : 2,
    shiftRed: ui ? 0.08 : 0.22,
    shiftBlue: ui ? 0.08 : 0.22,
    distortion: ui ? 0.02 : 0.05,
    contour: ui ? 0.28 : 0.38,
    scale: ui ? 0.92 : 1.02,
    rotation: 0,
    shape: "diamond" as const,
    angle: 70,
    colorBack: "#00000000",
    colorTint: "#FFFFFF",
  }
}

export function Logo({ size = 32, className, tone = "ui" }: LogoProps) {
  const settings = shaderSettings(size, tone)

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl",
        className
      )}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Zaylo"
    >
      <LiquidMetal
        {...settings}
        image={BRAND_LOGO_IMAGE}
        style={{
          position: "absolute",
          inset: "8%",
          width: "84%",
          height: "84%",
          display: "block",
        }}
      />
    </div>
  )
}
