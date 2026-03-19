"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Bot, TrendingUp, Shield, Clock, Sparkles } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI-Powered Guidance",
    description: "Our assistant helps you find the right project based on budget, area, and goals.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: TrendingUp,
    title: "Up to 9.1% ROI",
    description: "Curated projects with strong rental yields and capital appreciation potential.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Shield,
    title: "Developer-Direct Pricing",
    description: "No markups. Access payment plans with DLD waivers and post-handover options.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Clock,
    title: "Handover from Q2 2026",
    description: "Projects ranging from near-handover to new launches — pick your timeline.",
    color: "bg-amber-50 text-amber-600",
  },
]

export function OffPlanCTA() {
  return (
    <section className="relative py-24 bg-neutral-900 text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80')] bg-cover bg-center" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-900/95 to-neutral-900" />

      <div className="relative mx-auto max-w-6xl px-4">
        {/* ATTENTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Dubai Off-Plan Investment
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight leading-[1.1]">
            Invest in Dubai&apos;s Future,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
              Before Everyone Else
            </span>
          </h2>

          {/* INTEREST */}
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Off-plan properties offer the lowest entry prices, flexible payment plans, and the highest
            appreciation potential. Our AI guide helps you navigate 6+ premium projects from
            Dubai&apos;s top developers — in minutes, not weeks.
          </p>
        </motion.div>

        {/* DESIRE — Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
            >
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-white/70 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>

        {/* ACTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/off-plan"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-neutral-900 font-semibold hover:bg-neutral-100 transition-colors"
          >
            Explore Off-Plan Projects <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/opportunity"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-8 py-4 text-white font-semibold hover:bg-white/10 transition-colors"
          >
            Submit Your Interest
          </Link>
        </motion.div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-12 text-sm text-white/70"
        >
          <span>Emaar</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>DAMAC</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>Meraas</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>Nakheel</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>Majid Al Futtaim</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>Arada</span>
        </motion.div>
      </div>
    </section>
  )
}
