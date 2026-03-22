"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Bot, TrendingUp, Shield, Clock, Sparkles } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI-Powered Guidance",
    description: "Our assistant helps you find the right project based on budget, area, and goals.",
    color: "bg-violet-500/10 text-violet-400",
    borderColor: "border-violet-500/10 hover:border-violet-500/20",
  },
  {
    icon: TrendingUp,
    title: "Up to 9.1% ROI",
    description: "Curated projects with strong rental yields and capital appreciation potential.",
    color: "bg-emerald-500/10 text-emerald-400",
    borderColor: "border-emerald-500/10 hover:border-emerald-500/20",
  },
  {
    icon: Shield,
    title: "Developer-Direct Pricing",
    description: "No markups. Access payment plans with DLD waivers and post-handover options.",
    color: "bg-blue-500/10 text-blue-400",
    borderColor: "border-blue-500/10 hover:border-blue-500/20",
  },
  {
    icon: Clock,
    title: "Handover from Q2 2026",
    description: "Projects ranging from near-handover to new launches — pick your timeline.",
    color: "bg-amber-500/10 text-amber-400",
    borderColor: "border-amber-500/10 hover:border-amber-500/20",
  },
]

export function OffPlanCTA() {
  return (
    <section className="relative py-28 bg-neutral-950 text-white overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-t from-violet-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4">
        {/* ATTENTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm font-medium mb-6 text-white/70">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Dubai Off-Plan Investment
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight leading-[1.1]">
            Invest in Dubai&apos;s Future,{" "}
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-violet-400 bg-clip-text text-transparent">
              Before Everyone Else
            </span>
          </h2>

          {/* INTEREST */}
          <p className="text-lg text-white/40 max-w-2xl mx-auto leading-relaxed">
            Off-plan properties offer the lowest entry prices, flexible payment plans, and the highest
            appreciation potential. Our AI guide helps you navigate 6+ premium projects from
            Dubai&apos;s top developers — in minutes, not weeks.
          </p>
        </motion.div>

        {/* DESIRE — Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-2xl bg-white/[0.03] border ${f.borderColor} backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-300`}
            >
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold mb-2 text-white/90">{f.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{f.description}</p>
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
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-neutral-900 font-semibold hover:bg-neutral-100 transition-all duration-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
          >
            Explore Off-Plan Projects
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/opportunity"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-8 py-4 text-white font-semibold hover:bg-white/[0.06] hover:border-white/25 transition-all duration-200"
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
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-14 text-sm text-white/25 font-medium"
        >
          <span className="hover:text-white/40 transition-colors">Emaar</span>
          <span className="h-1 w-1 rounded-full bg-white/10" />
          <span className="hover:text-white/40 transition-colors">DAMAC</span>
          <span className="h-1 w-1 rounded-full bg-white/10" />
          <span className="hover:text-white/40 transition-colors">Meraas</span>
          <span className="h-1 w-1 rounded-full bg-white/10" />
          <span className="hover:text-white/40 transition-colors">Nakheel</span>
          <span className="h-1 w-1 rounded-full bg-white/10" />
          <span className="hover:text-white/40 transition-colors">Majid Al Futtaim</span>
          <span className="h-1 w-1 rounded-full bg-white/10" />
          <span className="hover:text-white/40 transition-colors">Arada</span>
        </motion.div>
      </div>
    </section>
  )
}
