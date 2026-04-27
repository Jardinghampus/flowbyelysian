"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      {/* Background Image */}
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2670&auto=format&fit=crop"
          alt="Dubai Skyline"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6 text-sm font-medium uppercase tracking-[0.3em] text-white/70"
        >
          Dubai&apos;s Premier Real Estate
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-6 max-w-5xl"
        >
          <span className="block text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl lg:text-8xl">Derrick</span>
          <span className="block text-3xl font-bold leading-[1.1] tracking-tight text-blue-400 md:text-4xl lg:text-5xl mt-2">Signature Properties</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-10 max-w-2xl text-lg text-white/70 md:text-xl"
        >
          From Palm Jumeirah to exclusive villa communities to Marina penthouses,
          find your perfect home or investment.
        </motion.p>

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

      {/* Stats Bar */}
      <motion.div
        style={{ opacity }}
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
