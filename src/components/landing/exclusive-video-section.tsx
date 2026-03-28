"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, TrendingUp, Eye, Clock, Zap, ArrowRight, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const stats = [
  { label: "Higher Engagement", value: "3.2x", icon: TrendingUp, description: "vs. standard photo listings" },
  { label: "More Inquiries", value: "47%", icon: Zap, description: "increase in qualified leads" },
  { label: "Avg. Watch Time", value: "2m 14s", icon: Clock, description: "per listing video" },
  { label: "More Views", value: "5.8x", icon: Eye, description: "on portal & social media" },
]

const steps = [
  {
    id: "shoot",
    title: "Premium Production",
    description: "Our videography team captures your property with cinematic drone aerials, smooth interior walkthroughs, and lifestyle storytelling that makes buyers feel at home before they visit.",
    visual: "film",
  },
  {
    id: "edit",
    title: "Studio-Grade Editing",
    description: "Every frame is colour-graded, paced for engagement, and scored with licensed music. We produce vertical shorts for social, full tours for portals, and highlight reels for WhatsApp.",
    visual: "edit",
  },
  {
    id: "distribute",
    title: "Multi-Channel Distribution",
    description: "Your listing video goes live across PropertyFinder, Bayut, Instagram Reels, YouTube Shorts, and TikTok — reaching qualified buyers where they actually spend their time.",
    visual: "distribute",
  },
]

export function ExclusiveVideoSection() {
  const [activeStep, setActiveStep] = useState(0)
  const [hoveredStat, setHoveredStat] = useState<number | null>(null)

  return (
    <section className="relative py-24 md:py-32 bg-neutral-950 overflow-hidden">
      {/* Background gradient accents */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-600/6 rounded-full blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <Badge className="mb-5 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            Exclusive with Zaylo
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
            Your Listing Deserves<br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-violet-400 bg-clip-text text-transparent">
              More Than Photos
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-neutral-400 leading-relaxed">
            Go exclusive with Zaylo and we produce cinematic listing videos that drive
            <span className="text-white font-medium"> 3x higher engagement </span>
            and sell properties faster. No extra cost — it&apos;s part of our commitment to you.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-16 md:mb-20"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                onHoverStart={() => setHoveredStat(i)}
                onHoverEnd={() => setHoveredStat(null)}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative group rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 md:p-6 backdrop-blur-sm cursor-default"
              >
                {/* Glow on hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-violet-500/5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredStat === i ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-blue-400" />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-white/80 mb-0.5">{stat.label}</div>
                  <div className="text-xs text-neutral-500">{stat.description}</div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Interactive How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-2">
              How It Works
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              From listing to sold — in three steps
            </h3>
          </div>

          {/* Step selector tabs */}
          <div className="flex justify-center gap-2 mb-10">
            {steps.map((step, i) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(i)}
                className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeStep === i
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                    : "bg-white/[0.05] text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold">
                    {i + 1}
                  </span>
                  <span className="hidden sm:inline">{step.title}</span>
                </span>
              </button>
            ))}
          </div>

          {/* Step content */}
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: visual */}
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/[0.06]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  {/* Step visual mockup */}
                  {activeStep === 0 && (
                    <div className="h-full w-full bg-gradient-to-br from-neutral-900 to-neutral-800 flex flex-col items-center justify-center p-8">
                      <div className="relative mb-6">
                        <div className="h-20 w-20 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                          <Play className="h-10 w-10 text-blue-400 ml-1" />
                        </div>
                        <motion.div
                          className="absolute -inset-3 rounded-2xl border-2 border-blue-500/30"
                          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                      <p className="text-white/80 text-sm text-center max-w-xs">
                        Cinematic 4K drone shots, smooth gimbal walkthroughs, and golden-hour exteriors
                      </p>
                      <div className="flex gap-2 mt-4">
                        {["Drone", "Interior", "Lifestyle"].map((tag) => (
                          <span key={tag} className="px-3 py-1 rounded-full bg-white/[0.06] text-[11px] text-white/60 font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeStep === 1 && (
                    <div className="h-full w-full bg-gradient-to-br from-neutral-900 to-neutral-800 flex flex-col items-center justify-center p-8">
                      {/* Timeline mockup */}
                      <div className="w-full max-w-sm space-y-3 mb-6">
                        {[
                          { label: "Aerial Intro", w: "75%", color: "bg-blue-500" },
                          { label: "Interior Tour", w: "100%", color: "bg-violet-500" },
                          { label: "Lifestyle B-Roll", w: "50%", color: "bg-emerald-500" },
                          { label: "Music & Grade", w: "90%", color: "bg-amber-500" },
                        ].map((track) => (
                          <div key={track.label} className="flex items-center gap-3">
                            <span className="text-[10px] text-white/40 font-mono w-20 text-right">{track.label}</span>
                            <div className="flex-1 h-6 rounded bg-white/[0.04] overflow-hidden">
                              <motion.div
                                className={`h-full rounded ${track.color}/30`}
                                initial={{ width: 0 }}
                                animate={{ width: track.w }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                style={{ background: `linear-gradient(90deg, ${track.color === 'bg-blue-500' ? '#3b82f680' : track.color === 'bg-violet-500' ? '#8b5cf680' : track.color === 'bg-emerald-500' ? '#10b98180' : '#f59e0b80'} 0%, transparent 100%)` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-white/80 text-sm text-center max-w-xs">
                        Professional colour grading, pacing, and licensed music for every format
                      </p>
                    </div>
                  )}
                  {activeStep === 2 && (
                    <div className="h-full w-full bg-gradient-to-br from-neutral-900 to-neutral-800 flex flex-col items-center justify-center p-8">
                      {/* Distribution channels */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        {[
                          { name: "PropertyFinder", emoji: "🏠" },
                          { name: "Bayut", emoji: "🔑" },
                          { name: "Instagram", emoji: "📸" },
                          { name: "YouTube", emoji: "▶️" },
                          { name: "TikTok", emoji: "🎵" },
                          { name: "WhatsApp", emoji: "💬" },
                        ].map((channel, i) => (
                          <motion.div
                            key={channel.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                          >
                            <span className="text-xl">{channel.emoji}</span>
                            <span className="text-[10px] text-white/60 font-medium">{channel.name}</span>
                          </motion.div>
                        ))}
                      </div>
                      <p className="text-white/80 text-sm text-center max-w-xs">
                        One shoot, multiple formats — optimised for every platform your buyers use
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: description + perks */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      {activeStep + 1}
                    </span>
                    <h4 className="text-xl font-bold text-white">{steps[activeStep].title}</h4>
                  </div>
                  <p className="text-neutral-400 leading-relaxed mb-6">
                    {steps[activeStep].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Always-visible perks */}
              <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  Included when you go exclusive
                </p>
                {[
                  "Cinematic listing video (60–90 seconds)",
                  "Social-ready vertical cuts (Reels, Shorts, TikTok)",
                  "Portal-optimised uploads (PropertyFinder & Bayut)",
                  "WhatsApp highlight clip for direct sharing",
                  "Professional photo package",
                ].map((perk) => (
                  <div key={perk} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-neutral-300">{perk}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="pt-4">
                <Link
                  href="/sign-up"
                  className="group inline-flex items-center gap-2 rounded-full bg-blue-500 px-7 py-3.5 text-white font-semibold hover:bg-blue-400 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  Go Exclusive with Zaylo
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
