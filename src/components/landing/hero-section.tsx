"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Play } from "lucide-react"

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1])

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
        <div className="absolute inset-0 bg-black/30" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
            Elysian Real Estate
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-6 max-w-4xl text-5xl font-bold leading-tight md:text-7xl lg:text-8xl"
        >
          Discover Luxury
          <br />
          <span className="text-blue-400">Living in Dubai</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-10 max-w-2xl text-lg text-white/80 md:text-xl"
        >
          From Palm Jumeirah villas to Marina penthouses, find your perfect home
          with Dubai&apos;s premier real estate agency.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/inventory"
            className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-neutral-900 font-semibold hover:bg-neutral-100 transition-colors"
          >
            Browse Properties
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <button className="inline-flex items-center justify-center rounded-full border-2 border-white px-8 py-4 text-white font-semibold hover:bg-white hover:text-neutral-900 transition-colors">
            <Play className="mr-2 h-4 w-4" />
            Watch Video
          </button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center"
          >
            <span className="text-xs uppercase tracking-widest text-white/60 mb-2">
              Scroll
            </span>
            <div className="h-14 w-[1px] bg-gradient-to-b from-white/60 to-transparent" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute bottom-0 left-0 right-0 z-20 bg-white/10 backdrop-blur-md border-t border-white/20"
      >
        <div className="mx-auto max-w-7xl px-4 py-6">
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
      <p className="text-sm text-white/70">{label}</p>
    </div>
  )
}
