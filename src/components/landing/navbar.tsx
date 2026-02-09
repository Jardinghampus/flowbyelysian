"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Menu, X, Phone } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "#properties", label: "Properties" },
  { href: "#areas", label: "Areas" },
  { href: "#team", label: "Our Team" },
  { href: "#contact", label: "Contact" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
            ? "bg-white/95 backdrop-blur-md shadow-sm"
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
                E
              </div>
              <span
                className={cn(
                  "text-xl font-bold transition-colors",
                  isScrolled ? "text-neutral-900" : "text-white"
                )}
              >
                ELYSIAN
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-blue-500",
                    isScrolled ? "text-neutral-600" : "text-white/90"
                  )}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href="tel:+971501234567"
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  isScrolled ? "text-neutral-600" : "text-white/90"
                )}
              >
                <Phone className="h-4 w-4" />
                +971 50 123 4567
              </a>
              <Link
                href="/sign-in"
                className={cn(
                  "rounded-full px-6 py-2.5 text-sm font-semibold transition-colors",
                  isScrolled
                    ? "bg-neutral-900 text-white hover:bg-neutral-800"
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
              className="fixed top-0 right-0 bottom-0 z-50 w-[300px] bg-white p-6 shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-bold text-neutral-900">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-lg font-medium text-neutral-900 py-2 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              <div className="mt-8 pt-8 border-t border-neutral-200 space-y-4">
                <a
                  href="tel:+971501234567"
                  className="flex items-center gap-3 text-neutral-600 hover:text-blue-600 transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  +971 50 123 4567
                </a>
                <Link
                  href="/sign-in"
                  className="block w-full rounded-full bg-neutral-900 px-6 py-3 text-center text-white font-semibold hover:bg-neutral-800 transition-colors"
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
