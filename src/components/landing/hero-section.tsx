"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  // Zoom effect - starts at 1 and zooms to 1.5 as you scroll
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.5])

  // Content fades out as you scroll
  const contentOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 0.3], [0, -50])

  // Overlay darkens slightly during zoom
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.4, 0.6])

  // Vignette effect intensifies
  const vignetteOpacity = useTransform(scrollYProgress, [0, 1], [0, 0.5])

  return (
    <section
      ref={containerRef}
      className="relative h-[200vh]"
    >
      {/* Sticky container for the hero */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Background Image with Zoom */}
        <motion.div
          style={{ scale }}
          className="absolute inset-0 will-change-transform"
        >
          <Image
            src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2670&auto=format&fit=crop"
            alt="Dubai Skyline"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>

        {/* Dark Overlay */}
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-black"
        />

        {/* Vignette Effect */}
        <motion.div
          style={{ opacity: vignetteOpacity }}
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]" />
        </motion.div>

        {/* Content */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white"
        >
          {/* Small Label */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 text-sm font-medium uppercase tracking-[0.3em] text-white/70"
          >
            Dubai&apos;s Premier Real Estate
          </motion.p>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-6 max-w-5xl text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl lg:text-8xl"
          >
            <span className="block">Elysian</span>
            <span className="block text-blue-400">Secondary Real Estate</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-10 max-w-2xl text-lg text-white/70 md:text-xl"
          >
            From Palm Jumeirah to exclusive villa communities to Marina penthouses,
            find your perfect home or investment.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/properties"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-neutral-900 font-semibold hover:bg-neutral-100 transition-colors"
            >
              View Collection
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center justify-center rounded-full border-2 border-white/30 px-8 py-4 text-white font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              Contact Us
            </Link>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center"
            >
              <span className="text-xs uppercase tracking-widest text-white/50 mb-3">
                Scroll to explore
              </span>
              <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Stats Bar at Bottom */}
        <motion.div
          style={{ opacity: contentOpacity }}
          className="absolute bottom-0 left-0 right-0 z-20 bg-white/10 backdrop-blur-md border-t border-white/10"
        >
          <div className="mx-auto max-w-7xl px-4 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <Stat value="500+" label="Properties Sold" />
              <Stat value="AED 2B+" label="In Transactions" />
              <Stat value="15+" label="Years Experience" />
              <Stat value="98%" label="Client Satisfaction" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center text-white">
      <p className="text-2xl md:text-3xl font-bold">{value}</p>
      <p className="text-sm text-white/60">{label}</p>
    </div>
  )
}
