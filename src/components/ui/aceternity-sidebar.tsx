"use client"

import { cn } from "@/lib/utils"
import Link, { LinkProps } from "next/link"
import React, { useState, createContext, useContext, useCallback, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Menu, X } from "lucide-react"

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
  return (
    <motion.div
      className={cn(
        "h-full px-4 py-4 hidden md:flex md:flex-col bg-white dark:bg-black w-[300px] flex-shrink-0",
        className
      )}
      animate={{
        width: animate ? (open ? "300px" : "70px") : "300px",
      }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => {
        lockedRef.current = false
        setOpen(true)
      }}
      onMouseLeave={() => {
        setOpen(false)
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
      <div
        className={cn(
          "h-14 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-neutral-200/60 dark:border-neutral-800/60 w-full"
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-sm">Z</span>
          </div>
          <span className="font-bold text-lg">Zaylo</span>
        </div>
        <button
          className="flex z-20 p-2 -mr-2 rounded-lg active:bg-neutral-100 dark:active:bg-neutral-800 transition-colors"
          onClick={() => setOpen(!open)}
        >
          <Menu className="text-neutral-800 dark:text-neutral-200 h-5 w-5" />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-white dark:bg-black p-6 z-[100] flex flex-col justify-between overflow-y-auto",
                className
              )}
            >
              <button
                className="absolute right-5 top-5 z-50 text-neutral-500 dark:text-neutral-400 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export const SidebarLink = ({
  link,
  className,
  isActive,
  disabled,
  ...props
}: {
  link: Links
  className?: string
  isActive?: boolean
  disabled?: boolean
  props?: LinkProps
}) => {
  const { open, animate, closeSidebar } = useSidebar()

  const content = (
    <>
      <div className={cn("flex-shrink-0", isActive && !disabled && "text-primary", disabled && "opacity-40")}>
        {link.icon}
      </div>
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className={cn(
          "text-neutral-700 dark:text-neutral-200 text-sm transition duration-150 whitespace-pre",
          !disabled && "group-hover/sidebar:translate-x-1",
          isActive && !disabled && "text-primary font-medium",
          disabled && "opacity-40 cursor-not-allowed"
        )}
      >
        {link.label}
      </motion.span>
    </>
  )

  if (disabled) {
    return (
      <div
        role="presentation"
        aria-disabled
        title="Early access — not enabled for your account yet"
        className={cn(
          "flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-lg transition-all duration-200 cursor-not-allowed",
          className
        )}
      >
        {content}
      </div>
    )
  }

  return (
    <Link
      href={link.href}
      onClick={() => closeSidebar()}
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-lg transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary"
          : "hover:bg-neutral-100 dark:hover:bg-neutral-800/60",
        className
      )}
      {...props}
    >
      {content}
    </Link>
  )
}
