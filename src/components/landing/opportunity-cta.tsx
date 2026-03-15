"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, ShoppingCart, Tag, Key, Building, Globe, CheckCircle2 } from "lucide-react"

const stats = [
  { value: "48h", label: "Avg. Match Time" },
  { value: "2,400+", label: "Active Opportunities" },
  { value: "98%", label: "Client Satisfaction" },
]

const roles = [
  { icon: ShoppingCart, label: "Buyers", color: "text-blue-600 bg-blue-50" },
  { icon: Tag, label: "Sellers", color: "text-emerald-600 bg-emerald-50" },
  { icon: Key, label: "Renters", color: "text-violet-600 bg-violet-50" },
  { icon: Building, label: "Leasers", color: "text-amber-600 bg-amber-50" },
  { icon: Globe, label: "Relocators", color: "text-rose-600 bg-rose-50" },
]

const benefits = [
  "Matched with a dedicated Zaylo agent within 48 hours",
  "Access to off-market and exclusive listings",
  "Full confidentiality — your details stay with Zaylo",
  "Track and manage your opportunities from your dashboard",
]

export function OpportunityCTA() {
  return (
    <section className="py-24 bg-gradient-to-b from-white via-neutral-50 to-white overflow-hidden">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left — AIDA Copy */}
          <div>
            {/* ATTENTION */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-6">
                For Buyers, Sellers, Renters & More
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4 tracking-tight leading-[1.1]">
                Your Next Property Move{" "}
                <span className="text-blue-600">Starts Here</span>
              </h2>
            </motion.div>

            {/* INTEREST */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-neutral-600 mb-8 leading-relaxed"
            >
              Submit your opportunity in under 3 minutes. Whether you&apos;re buying your first home,
              selling a villa, or relocating to Dubai — Zaylo connects you with the right agent
              and the right match, faster than any traditional agency.
            </motion.p>

            {/* DESIRE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-3 mb-10"
            >
              {benefits.map((b) => (
                <div key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">{b}</span>
                </div>
              ))}
            </motion.div>

            {/* ACTION */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="/opportunity"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-8 py-4 text-white font-semibold hover:bg-neutral-800 transition-colors"
              >
                Submit Your Opportunity <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/user/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-neutral-300 px-8 py-4 text-neutral-700 font-semibold hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
              >
                Log In to Dashboard
              </Link>
            </motion.div>
          </div>

          {/* Right — Visual Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative">
              {/* Role cards */}
              <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl p-8 space-y-6">
                <h3 className="text-lg font-bold text-neutral-900">Who is this for?</h3>
                <div className="flex flex-wrap gap-3">
                  {roles.map((r) => (
                    <div key={r.label} className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-100">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${r.color}`}>
                        <r.icon className="h-4.5 w-4.5" />
                      </div>
                      <span className="text-sm font-semibold text-neutral-800">{r.label}</span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-neutral-100" />

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {stats.map((s) => (
                    <div key={s.label} className="text-center">
                      <span className="text-2xl font-bold text-neutral-900">{s.value}</span>
                      <span className="block text-xs text-neutral-500 mt-1">{s.label}</span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-neutral-100" />

                <div className="flex items-center gap-3 text-sm text-neutral-500">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <span>Join 2,400+ people already using Zaylo</span>
                </div>
              </div>

              {/* Decorative */}
              <div className="absolute -z-10 -top-4 -right-4 w-full h-full rounded-3xl bg-blue-100/50 border border-blue-200/30" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
