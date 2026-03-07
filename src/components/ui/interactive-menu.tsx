"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"

type IconComponentType = React.ElementType<{ className?: string }>

export interface InteractiveMenuItem {
  label: string
  icon: IconComponentType
  href?: string
}

export interface InteractiveMenuProps {
  items: InteractiveMenuItem[]
  activeIndex?: number
  onItemClick?: (index: number) => void
  accentColor?: string
  className?: string
}

export function InteractiveMenu({
  items,
  activeIndex: controlledIndex,
  onItemClick,
  accentColor,
  className,
}: InteractiveMenuProps) {
  const [internalIndex, setInternalIndex] = useState(0)
  const activeIndex = controlledIndex ?? internalIndex

  const textRefs = useRef<(HTMLElement | null)[]>([])
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const setLineWidth = () => {
      const activeItemElement = itemRefs.current[activeIndex]
      const activeTextElement = textRefs.current[activeIndex]
      if (activeItemElement && activeTextElement) {
        const textWidth = activeTextElement.offsetWidth
        activeItemElement.style.setProperty("--lineWidth", `${textWidth}px`)
      }
    }
    setLineWidth()
    window.addEventListener("resize", setLineWidth)
    return () => window.removeEventListener("resize", setLineWidth)
  }, [activeIndex, items])

  const handleItemClick = (index: number) => {
    setInternalIndex(index)
    onItemClick?.(index)
  }

  const style = useMemo(
    () =>
      ({
        "--component-active-color": accentColor || "hsl(var(--primary))",
      }) as React.CSSProperties,
    [accentColor]
  )

  return (
    <nav
      className={cn(
        "interactive-menu flex items-stretch justify-around w-full",
        className
      )}
      role="navigation"
      style={style}
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex
        const IconComponent = item.icon
        return (
          <button
            key={item.label}
            className={cn(
              "interactive-menu__item flex flex-col items-center justify-center gap-1 flex-1 py-2 px-1 transition-all duration-300 relative",
              isActive && "interactive-menu__item--active"
            )}
            onClick={() => handleItemClick(index)}
            ref={(el) => {
              itemRefs.current[index] = el
            }}
          >
            <div
              className={cn(
                "transition-all duration-300",
                isActive
                  ? "text-[var(--component-active-color)] scale-110 -translate-y-0.5"
                  : "text-muted-foreground"
              )}
            >
              <IconComponent className="h-[22px] w-[22px]" />
            </div>
            <strong
              className={cn(
                "text-[11px] font-medium leading-tight transition-all duration-300",
                isActive
                  ? "text-[var(--component-active-color)] opacity-100"
                  : "text-muted-foreground opacity-70"
              )}
              ref={(el) => {
                textRefs.current[index] = el
              }}
            >
              {item.label}
            </strong>
            {/* Active indicator line */}
            {isActive && (
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-[var(--component-active-color)] transition-all duration-300"
                style={{ width: "var(--lineWidth, 24px)" }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
