"use client"

import { ShootingStars } from "@/components/ui/shooting-stars"
import { StarsBackground } from "@/components/ui/stars-background"
import { cn } from "@/lib/utils"

type SpaceBackgroundProps = {
  className?: string
  /** More stars + faster meteors for landing/sign-in */
  intense?: boolean
}

export function SpaceBackground({ className, intense = true }: SpaceBackgroundProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <StarsBackground
        starDensity={intense ? 0.00042 : 0.00025}
        minTwinkleSpeed={intense ? 0.15 : 0.5}
        maxTwinkleSpeed={intense ? 0.55 : 1}
        twinkleProbability={0.85}
      />
      <ShootingStars
        starColor="#ffffff"
        trailColor="#d4d4d8"
        minDelay={intense ? 180 : 800}
        maxDelay={intense ? 900 : 3200}
        minSpeed={18}
        maxSpeed={42}
        maxConcurrent={intense ? 5 : 2}
        starWidth={14}
      />
      {intense ? (
        <ShootingStars
          starColor="#e5e5e5"
          trailColor="#737373"
          minDelay={400}
          maxDelay={1400}
          minSpeed={12}
          maxSpeed={28}
          maxConcurrent={3}
          starWidth={8}
          starHeight={0.8}
          className="opacity-70"
        />
      ) : null}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,10,0.45)_70%,rgba(10,10,10,0.85)_100%)]" />
    </div>
  )
}
