"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Menu, X, Phone, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/use-theme"
import { useMobileMenu } from "@/contexts/mobile-menu-context"

const navLinks = [
  { href: "/communities", label: "Communities" },
  { href: "/properties", label: "Properties" },
  { href: "/off-plan", label: "Off-Plan" },
  { href: "/opportunity", label: "Submit Opportunity" },
  { href: "/feature", label: "Features" },
  { href: "#contact", label: "Contact" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { isMenuOpen: isMobileMenuOpen, setMenuOpen: setIsMobileMenuOpen } = useMobileMenu()
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  const toggleTheme = () => setTheme(isDark ? "light" : "dark")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md shadow-sm dark:shadow-neutral-900/20"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl font-bold text-lg transition-colors",
                  isScrolled
                    ? "bg-neutral-900 text-white"
                    : "bg-white text-neutral-900"
                )}
              >
                Z
              </div>
              <span
                className={cn(
                  "text-xl font-bold transition-colors",
                  isScrolled ? "text-neutral-900 dark:text-white" : "text-white"
                )}
              >
                ZAYLO
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                link.href.startsWith("/") ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-blue-500",
                      isScrolled ? "text-neutral-600 dark:text-neutral-400" : "text-white/90"
                    )}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-blue-500",
                      isScrolled ? "text-neutral-600 dark:text-neutral-400" : "text-white/90"
                    )}
                  >
                    {link.label}
                  </a>
                )
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="tel:+971501234567"
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  isScrolled ? "text-neutral-600 dark:text-neutral-400" : "text-white/90"
                )}
              >
                <Phone className="h-4 w-4" />
                +971 50 123 4567
              </a>
              <button
                onClick={toggleTheme}
                className={cn(
                  "h-9 w-9 rounded-full flex items-center justify-center transition-colors",
                  isScrolled
                    ? "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    : "text-white/80 hover:bg-white/10"
                )}
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isDark ? (
                    <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Sun className="h-[18px] w-[18px]" />
                    </motion.div>
                  ) : (
                    <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Moon className="h-[18px] w-[18px]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
              <Link
                href="/user/dashboard"
                className={cn(
                  "rounded-full px-5 py-2.5 text-sm font-semibold transition-colors border",
                  isScrolled
                    ? "border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    : "border-white/30 text-white hover:bg-white/10"
                )}
              >
                Log In
              </Link>
              <Link
                href="/app/dashboard"
                className={cn(
                  "rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                  isScrolled
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100"
                    : "bg-white text-neutral-900 hover:bg-neutral-100"
                )}
              >
                Agent Login
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={cn(
                "md:hidden p-2 rounded-lg transition-colors",
                isScrolled
                  ? "text-neutral-900 hover:bg-neutral-100"
                  : "text-white hover:bg-white/10"
              )}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[300px] bg-white dark:bg-neutral-900 p-6 shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-bold text-neutral-900 dark:text-white">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="space-y-4">
                {navLinks.map((link) => (
                  link.href.startsWith("/") ? (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-lg font-medium text-neutral-900 dark:text-white py-2 hover:text-blue-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-lg font-medium text-neutral-900 dark:text-white py-2 hover:text-blue-600 transition-colors"
                    >
                      {link.label}
                    </a>
                  )
                ))}
              </nav>

              <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-700 space-y-3">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 w-full text-neutral-600 dark:text-neutral-400 hover:text-blue-600 transition-colors py-2"
                >
                  {isDark ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5" />}
                  {isDark ? "Light Mode" : "Dark Mode"}
                </button>
                <a
                  href="tel:+971501234567"
                  className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400 hover:text-blue-600 transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  +971 50 123 4567
                </a>
                <Link
                  href="/user/dashboard"
                  className="block w-full rounded-full border-2 border-neutral-900 dark:border-white px-6 py-3 text-center text-neutral-900 dark:text-white font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/app/dashboard"
                  className="block w-full rounded-full bg-neutral-900 dark:bg-white px-6 py-3 text-center text-white dark:text-neutral-900 font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
                >
                  Agent Login
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
