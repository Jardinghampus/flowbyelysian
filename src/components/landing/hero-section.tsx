"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { SparklesText } from "@/components/ui/sparkles-text"
import { ArrowRight } from "lucide-react"

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
        {/* Multi-layer overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
      </motion.div>

      {/* Subtle grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6 text-sm font-medium uppercase tracking-[0.3em] text-white/60"
        >
          Dubai&apos;s Premier Real Estate
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-6 max-w-5xl"
        >
          <SparklesText
            text="Zaylo"
            className="text-5xl font-bold leading-[1.1] tracking-tight text-white md:text-7xl lg:text-8xl"
            colors={{ first: "#60A5FA", second: "#A78BFA" }}
            sparklesCount={12}
          />
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="block text-3xl font-bold leading-[1.1] tracking-tight bg-gradient-to-r from-blue-400 via-blue-300 to-violet-400 bg-clip-text text-transparent md:text-4xl lg:text-5xl mt-2"
          >
            Marketplace
          </motion.span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-10 max-w-2xl text-lg text-white/60 md:text-xl leading-relaxed"
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
            href="/user/marketplace"
            className="group inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-neutral-900 font-semibold hover:bg-white/90 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            View Collection
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href="#contact"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-white font-semibold hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
          >
            Contact Us
          </Link>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-28 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center"
          >
            <span className="text-xs uppercase tracking-widest text-white/40 mb-3">
              Scroll to explore
            </span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Stats Bar — Premium Glassmorphism */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-0 left-0 right-0 z-20"
      >
        <div className="bg-white/[0.08] backdrop-blur-xl border-t border-white/[0.08]">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <Stat value="500+" label="Properties Sold" delay={0} />
              <Stat value="AED 2B+" label="In Transactions" delay={0.1} />
              <Stat value="15+" label="Years Experience" delay={0.2} />
              <Stat value="98%" label="Client Satisfaction" delay={0.3} />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function Stat({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1 + delay }}
      className="text-center text-white"
    >
      <p className="text-2xl md:text-3xl font-bold tracking-tight">{value}</p>
      <p className="text-sm text-white/40 mt-0.5">{label}</p>
    </motion.div>
  )
}
