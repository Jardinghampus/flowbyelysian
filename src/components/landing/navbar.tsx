"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Menu, X, Phone, Sun, Moon, ArrowRight } from "lucide-react"
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
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl font-bold text-lg transition-all duration-300 group-hover:scale-105",
                  isScrolled
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                    : "bg-white text-neutral-900"
                )}
              >
                Z
              </div>
              <span
                className={cn(
                  "text-xl font-bold transition-colors duration-300",
                  isScrolled ? "text-neutral-900 dark:text-white" : "text-white"
                )}
              >
                ZAYLO
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Component = link.href.startsWith("/") ? Link : "a"
                return (
                  <Component
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-3.5 py-2 text-sm font-medium transition-colors duration-200 rounded-lg",
                      isScrolled
                        ? "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {link.label}
                  </Component>
                )
              })}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="tel:+971501234567"
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors duration-200",
                  isScrolled ? "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white" : "text-white/70 hover:text-white"
                )}
              >
                <Phone className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">+971 50 123 4567</span>
              </a>
              <button
                onClick={toggleTheme}
                className={cn(
                  "h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200",
                  isScrolled
                    ? "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    : "text-white/70 hover:bg-white/10"
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
                  "rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 border",
                  isScrolled
                    ? "border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600"
                    : "border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                )}
              >
                Log In
              </Link>
              <Link
                href="/user/dashboard"
                className={cn(
                  "group rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 flex items-center gap-1.5",
                  isScrolled
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 hover:shadow-lg"
                    : "bg-white text-neutral-900 hover:bg-neutral-100 hover:shadow-lg"
                )}
              >
                Get Started
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={cn(
                "md:hidden p-2 rounded-lg transition-colors",
                isScrolled
                  ? "text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
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
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[320px] bg-white dark:bg-neutral-900 p-6 shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 dark:bg-white font-bold text-lg text-white dark:text-neutral-900">
                    Z
                  </div>
                  <span className="text-xl font-bold text-neutral-900 dark:text-white">ZAYLO</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navLinks.map((link, i) => {
                  const Component = link.href.startsWith("/") ? Link : "a"
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                    >
                      <Component
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-base font-medium text-neutral-900 dark:text-white py-3 px-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                      >
                        {link.label}
                      </Component>
                    </motion.div>
                  )
                })}
              </nav>

              <div className="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 w-full text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors py-2.5 px-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  {isDark ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5" />}
                  {isDark ? "Light Mode" : "Dark Mode"}
                </button>
                <a
                  href="tel:+971501234567"
                  className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors py-2.5 px-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <Phone className="h-5 w-5" />
                  +971 50 123 4567
                </a>
                <div className="pt-4 space-y-3">
                  <Link
                    href="/user/dashboard"
                    className="block w-full rounded-full border border-neutral-200 dark:border-neutral-700 px-6 py-3.5 text-center text-neutral-900 dark:text-white font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="block w-full rounded-full bg-neutral-900 dark:bg-white px-6 py-3.5 text-center text-white dark:text-neutral-900 font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
