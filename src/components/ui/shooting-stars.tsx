"use client"

import { cn } from "@/lib/utils"
import React, { useEffect, useState, useRef } from "react"

interface ShootingStar {
  id: number
  x: number
  y: number
  angle: number
  scale: number
  speed: number
  distance: number
}

interface ShootingStarsProps {
  minSpeed?: number
  maxSpeed?: number
  minDelay?: number
  maxDelay?: number
  maxConcurrent?: number
  starColor?: string
  trailColor?: string
  starWidth?: number
  starHeight?: number
  className?: string
}

const getRandomStartPoint = () => {
  const side = Math.floor(Math.random() * 4)
  const offset = Math.random() * window.innerWidth

  switch (side) {
    case 0:
      return { x: offset, y: 0, angle: 45 }
    case 1:
      return { x: window.innerWidth, y: offset, angle: 135 }
    case 2:
      return { x: offset, y: window.innerHeight, angle: 225 }
    case 3:
      return { x: 0, y: offset, angle: 315 }
    default:
      return { x: 0, y: 0, angle: 45 }
  }
}

function spawnStar(): ShootingStar {
  const { x, y, angle } = getRandomStartPoint()
  return {
    id: Date.now() + Math.random(),
    x,
    y,
    angle,
    scale: 1,
    speed: 0,
    distance: 0,
  }
}

export const ShootingStars: React.FC<ShootingStarsProps> = ({
  minSpeed = 10,
  maxSpeed = 30,
  minDelay = 1200,
  maxDelay = 4200,
  maxConcurrent = 1,
  starColor = "#9E00FF",
  trailColor = "#2EB9DF",
  starWidth = 10,
  starHeight = 1,
  className,
}) => {
  const [stars, setStars] = useState<ShootingStar[]>([])
  const starsRef = useRef<ShootingStar[]>([])
  const gradientId = useRef(`gradient-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    starsRef.current = stars
  }, [stars])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    let cancelled = false

    const scheduleSpawn = () => {
      if (cancelled) return
      const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay
      timeoutId = setTimeout(() => {
        setStars((prev) => {
          if (prev.length >= maxConcurrent) return prev
          const star = spawnStar()
          star.speed = Math.random() * (maxSpeed - minSpeed) + minSpeed
          return [...prev, star]
        })
        scheduleSpawn()
      }, randomDelay)
    }

    for (let i = 0; i < maxConcurrent; i++) {
      setTimeout(() => {
        setStars((prev) => {
          if (prev.length >= maxConcurrent) return prev
          const star = spawnStar()
          star.speed = Math.random() * (maxSpeed - minSpeed) + minSpeed
          return [...prev, star]
        })
      }, i * 200)
    }

    scheduleSpawn()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [minSpeed, maxSpeed, minDelay, maxDelay, maxConcurrent])

  useEffect(() => {
    let frameId = 0

    const moveStars = () => {
      setStars((prev) =>
        prev
          .map((star) => {
            const newX = star.x + star.speed * Math.cos((star.angle * Math.PI) / 180)
            const newY = star.y + star.speed * Math.sin((star.angle * Math.PI) / 180)
            const newDistance = star.distance + star.speed
            const newScale = 1 + newDistance / 100
            return {
              ...star,
              x: newX,
              y: newY,
              distance: newDistance,
              scale: newScale,
            }
          })
          .filter(
            (star) =>
              star.x >= -40 &&
              star.x <= window.innerWidth + 40 &&
              star.y >= -40 &&
              star.y <= window.innerHeight + 40
          )
      )
      frameId = requestAnimationFrame(moveStars)
    }

    frameId = requestAnimationFrame(moveStars)
    return () => cancelAnimationFrame(frameId)
  }, [])

  return (
    <svg ref={useRef<SVGSVGElement>(null)} className={cn("absolute inset-0 h-full w-full", className)}>
      {stars.map((star) => (
        <rect
          key={star.id}
          x={star.x}
          y={star.y}
          width={starWidth * star.scale}
          height={starHeight}
          fill={`url(#${gradientId.current})`}
          transform={`rotate(${star.angle}, ${star.x + (starWidth * star.scale) / 2}, ${star.y + starHeight / 2})`}
        />
      ))}
      <defs>
        <linearGradient id={gradientId.current} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: trailColor, stopOpacity: 0 }} />
          <stop offset="100%" style={{ stopColor: starColor, stopOpacity: 1 }} />
        </linearGradient>
      </defs>
    </svg>
  )
}
