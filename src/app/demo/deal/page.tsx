"use client"

import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  Calendar,
  FileText,
  Code2,
  Wrench,
  Users,
  Shield,
  ArrowRight,
} from "lucide-react"
import { Logo } from "@/components/logo"

const dealPrice = 500000 // AED — full rights
const upfrontPercent = 50
const installmentMonths = 6
const upfront = dealPrice * (upfrontPercent / 100)
const monthlyPayment = (dealPrice - upfront) / installmentMonths

const timeline = [
  {
    phase: "Signing",
    title: "Deal & Handover",
    items: [
      "50% upfront payment",
      "Full source code transfer",
      "All credentials & API keys handed over",
      "GitHub repo access granted",
    ],
  },
  {
    phase: "Month 1",
    title: "Customization & Branding",
    items: [
      "Rebrand to agency identity",
      "Custom domain & deployment",
      "Team accounts setup",
      "First installment payment",
    ],
  },
  {
    phase: "Month 2–3",
    title: "Feature Development",
    items: [
      "Agency-specific features",
      "Integration with existing tools",
      "Team training & onboarding",
      "Continued installment payments",
    ],
  },
  {
    phase: "Month 4–6",
    title: "Growth & Scale",
    items: [
      "Performance optimization",
      "New modules as needed",
      "Final installment payments",
      "Full ownership confirmed",
    ],
  },
]

const included = [
  { icon: Code2, label: "Complete source code (Next.js, React, TypeScript)" },
  { icon: FileText, label: "Supabase database schema & all migrations" },
  { icon: Shield, label: "Authentication system (Clerk)" },
  { icon: Users, label: "Role-based access (Admin, Agent, Customer)" },
  { icon: Wrench, label: "All API integrations (OpenAI, Mapbox, Google)" },
  { icon: Calendar, label: "Android mobile app (Capacitor)" },
]

export default function DealPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 pt-10">
        <button
          onClick={() => router.push("/demo")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" /> Back to overview
        </button>

        <div className="flex items-center gap-3 mb-8">
          <Logo size={32} />
          <span className="text-lg font-semibold tracking-tight text-zinc-400">ZFlow by Zaylo</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Deal Terms</h1>
        <p className="text-xl text-zinc-400 mb-16">
          Simple, fair structure. You get the platform, I join your team and keep building.
        </p>
      </div>

      {/* Price Card */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-transparent p-8 md:p-10">
          <div className="text-sm text-cyan-400 font-medium mb-2">Total Platform Price</div>
          <div className="text-5xl md:text-6xl font-bold mb-6 font-mono">
            {dealPrice.toLocaleString()} <span className="text-2xl text-zinc-400">AED</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-black/40 border border-zinc-800">
              <div className="text-sm text-zinc-400 mb-1">Upfront ({upfrontPercent}%)</div>
              <div className="text-3xl font-bold font-mono text-cyan-400">
                {upfront.toLocaleString()} <span className="text-base text-zinc-500">AED</span>
              </div>
              <div className="text-sm text-zinc-500 mt-1">Due at signing</div>
            </div>
            <div className="p-5 rounded-xl bg-black/40 border border-zinc-800">
              <div className="text-sm text-zinc-400 mb-1">Monthly ({installmentMonths} months)</div>
              <div className="text-3xl font-bold font-mono">
                {monthlyPayment.toLocaleString()} <span className="text-base text-zinc-500">AED/mo</span>
              </div>
              <div className="text-sm text-zinc-500 mt-1">Months 1–{installmentMonths}</div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-sm text-zinc-400">
            <strong className="text-cyan-400">Compared to building from scratch:</strong> 655,000+ AED and 6–12 months of development time.
            You save <span className="text-white font-semibold">{(655000 - dealPrice).toLocaleString()} AED</span> and start operating immediately.
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <h2 className="text-2xl font-bold mb-6">What&apos;s Included</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {included.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
              <item.icon className="w-5 h-5 text-cyan-400 shrink-0" />
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <h2 className="text-2xl font-bold mb-8">Delivery Timeline</h2>
        <div className="space-y-6">
          {timeline.map((phase, i) => (
            <div key={i} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-sm font-bold text-cyan-400">
                  {i + 1}
                </div>
                {i < timeline.length - 1 && (
                  <div className="w-px h-full bg-zinc-800 mt-2" />
                )}
              </div>
              <div className="pb-6">
                <div className="text-xs text-cyan-400 font-medium mb-1">{phase.phase}</div>
                <h3 className="text-lg font-semibold mb-3">{phase.title}</h3>
                <div className="space-y-2">
                  {phase.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm text-zinc-400">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500/60 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Offer */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8">
          <h2 className="text-2xl font-bold mb-4">The Full Package</h2>
          <p className="text-zinc-400 mb-6">
            This isn&apos;t just a software purchase — it&apos;s a tech partnership. You&apos;re not buying code
            from a stranger, you&apos;re getting the developer who built it, embedded in your team.
          </p>
          <div className="space-y-3">
            {[
              "Complete platform with 10+ modules",
              "Full source code ownership after final payment",
              "I join your agency and continue building",
              "Custom features tailored to your workflow",
              "No external dev agency fees — everything in-house",
              "Mobile app included (Android, iOS roadmap)",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Let&apos;s build something great together.</h2>
        <p className="text-zinc-400 mb-8">Ready to discuss? Let&apos;s set up a meeting.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => router.push("/demo")}
            className="px-8 py-4 border border-zinc-700 rounded-xl hover:border-cyan-500/50 transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Features
          </button>
          <button
            onClick={() => router.push("/pipeline")}
            className="px-8 py-4 bg-cyan-500 text-black font-semibold rounded-xl hover:bg-cyan-400 transition-all flex items-center gap-2"
          >
            Try Live Demo <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <footer className="border-t border-zinc-800 py-8 text-center text-sm text-zinc-500">
        ZFlow by Zaylo — Confidential Proposal &middot; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
