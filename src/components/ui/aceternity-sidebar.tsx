"use client"

import { cn } from "@/lib/utils"
import Link, { LinkProps } from "next/link"
import React, { useState, createContext, useContext, useCallback, useRef, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Logo } from "@/components/logo"
import { useFullscreenContext } from "@/contexts/fullscreen-context"

interface Links {
  label: string
  href: string
  icon: React.JSX.Element | React.ReactNode
}

interface SidebarContextProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  animate: boolean
  closeSidebar: () => void
  lockedRef: React.MutableRefObject<boolean>
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined)

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode
  open?: boolean
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
  animate?: boolean
}) => {
  const [openState, setOpenState] = useState(false)
  const lockedRef = useRef(false)

  const open = openProp !== undefined ? openProp : openState
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState

  const closeSidebar = useCallback(() => {
    setOpen(false)
    lockedRef.current = true
  }, [setOpen])

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (typeof window === "undefined") return
    const isMobile = window.innerWidth < 768
    if (isMobile && open) {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [open])

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate, closeSidebar, lockedRef }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode
  open?: boolean
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
  animate?: boolean
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  )
}

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  // Extract only the props that MobileSidebar needs (className, children)
  const { className, children } = props
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar className={className as string}>{children as React.ReactNode}</MobileSidebar>
    </>
  )
}

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate, lockedRef } = useSidebar()
  const { isFullscreen } = useFullscreenContext()

  // In fullscreen mode, sidebar is always expanded
  const effectiveOpen = isFullscreen || open

  return (
    <motion.div
      className={cn(
        "h-full px-3 py-4 hidden md:flex md:flex-col bg-white dark:bg-black w-[300px] flex-shrink-0",
        className
      )}
      animate={{
        width: animate ? (effectiveOpen ? "300px" : "70px") : "300px",
      }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => {
        if (!isFullscreen) {
          lockedRef.current = false
          setOpen(true)
        }
      }}
      onMouseLeave={() => {
        if (!isFullscreen) {
          setOpen(false)
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar()
  return (
    <>
      {/* Mobile top bar */}
      <div
        className={cn(
          "h-14 px-4 flex flex-row md:hidden items-center justify-between bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-neutral-200/60 dark:border-neutral-800/60 w-full sticky top-0 z-30",
          "pt-[env(safe-area-inset-top)]"
        )}
        {...props}
      >
        <Link href="/user/dashboard" className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Logo size={20} className="text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-neutral-900 dark:text-white tracking-tight">ZFLOW</span>
        </Link>
        <button
          className="flex p-2 -mr-2 rounded-lg active:bg-neutral-100 dark:active:bg-neutral-800 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <Menu className="text-neutral-800 dark:text-neutral-200 h-5 w-5" />
        </button>
      </div>

      {/* Mobile sidebar overlay + panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />
            {/* Sidebar panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                duration: 0.3,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className={cn(
                "fixed top-0 left-0 bottom-0 w-[280px] max-w-[85vw] bg-white dark:bg-black z-[100] flex flex-col md:hidden",
                "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
                "shadow-2xl border-r border-neutral-200/60 dark:border-neutral-800/60"
              )}
            >
              {/* Close button row */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
                <Link href="/user/dashboard" className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Logo size={20} className="text-primary-foreground" />
                  </div>
                  <span className="font-bold text-lg text-neutral-900 dark:text-white tracking-tight">ZFLOW</span>
                </Link>
                <button
                  className="text-neutral-500 dark:text-neutral-400 p-2 -mr-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 active:bg-neutral-200 dark:active:bg-neutral-700 transition-colors"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {/* Scrollable nav content */}
              <div className={cn("flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 flex flex-col justify-between gap-6", className)}>
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export const SidebarLink = ({
  link,
  className,
  isActive,
  ...props
}: {
  link: Links
  className?: string
  isActive?: boolean
  props?: LinkProps
}) => {
  const { open, animate, closeSidebar } = useSidebar()
  const { isFullscreen } = useFullscreenContext()

  // In fullscreen mode, sidebar links are always shown expanded
  const effectiveOpen = isFullscreen || open

  return (
    <Link
      href={link.href}
      onClick={() => { if (!isFullscreen) closeSidebar() }}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-2.5 px-3 rounded-xl transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary"
          : "hover:bg-neutral-100 dark:hover:bg-neutral-800/60 active:bg-neutral-200 dark:active:bg-neutral-700/60",
        className
      )}
      {...props}
    >
      <div className={cn("flex-shrink-0", isActive && "text-primary")}>
        {link.icon}
      </div>
      <motion.span
        animate={{
          display: animate ? (effectiveOpen ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (effectiveOpen ? 1 : 0) : 1,
        }}
        className={cn(
          "text-neutral-700 dark:text-neutral-200 text-[15px] leading-tight group-hover/sidebar:translate-x-0.5 transition duration-150 whitespace-pre",
          isActive && "text-primary font-semibold"
        )}
      >
        {link.label}
      </motion.span>
    </Link>
  )
}
