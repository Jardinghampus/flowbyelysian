"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Brain,
  BarChart3,
  Users,
  Building2,
  MessageSquare,
  FileText,
  Shield,
  Smartphone,
  Globe,
  ArrowRight,
  CheckCircle2,
  Zap,
  Clock,
  DollarSign,
  ChevronRight,
  Play,
} from "lucide-react"
import { Logo } from "@/components/logo"

const features = [
  {
    icon: Brain,
    title: "AI Assistant",
    description: "GPT-powered real estate assistant trained on Dubai market data. Instant answers, property comparisons, and market insights.",
    path: "/ai-assistant",
    tag: "AI-Powered",
  },
  {
    icon: Users,
    title: "Owner Intelligence",
    description: "Look up property owners, bulk CSV uploads, contact management. Your competitive edge in off-market deals.",
    path: "/owner-intelligence",
    tag: "Unique",
  },
  {
    icon: BarChart3,
    title: "Pipeline & CRM",
    description: "Kanban-style deal pipeline with drag-and-drop. Track every lead from first contact to closed deal.",
    path: "/pipeline",
    tag: "Core",
  },
  {
    icon: Building2,
    title: "My Listings",
    description: "Upload and manage your property portfolio. Professional descriptions, images, and instant sharing.",
    path: "/my-listings",
    tag: "Core",
  },
  {
    icon: Globe,
    title: "Marketplace & Exchange",
    description: "Internal listing exchange between agents. Share inventory, request properties, collaborate on deals.",
    path: "/marketplace",
    tag: "Collaboration",
  },
  {
    icon: BarChart3,
    title: "Market Statistics",
    description: "Live market data, area analytics, price trends, and inventory tracking across Dubai communities.",
    path: "/market-statistics",
    tag: "Analytics",
  },
  {
    icon: FileText,
    title: "Description Writer",
    description: "AI-generated property descriptions in seconds. Professional, SEO-optimized, multi-language support.",
    path: "/description-writer",
    tag: "AI-Powered",
  },
  {
    icon: MessageSquare,
    title: "Follow-Up System",
    description: "Automated follow-up reminders and templates. Never lose a lead due to missed communication.",
    path: "/follow-up",
    tag: "Automation",
  },
  {
    icon: Shield,
    title: "Admin Panel",
    description: "Full agency management — users, roles, performance tracking, and agency listings control.",
    path: "/admin",
    tag: "Management",
  },
  {
    icon: Smartphone,
    title: "Mobile App",
    description: "Native Android app via Capacitor. Your entire CRM in your pocket, with push notifications.",
    path: "#",
    tag: "Mobile",
  },
]

const buildCosts = [
  { item: "CRM & Pipeline System", cost: "120,000" },
  { item: "AI Integration (GPT + Embeddings)", cost: "90,000" },
  { item: "Owner Intelligence Module", cost: "70,000" },
  { item: "Marketplace & Exchange", cost: "55,000" },
  { item: "Market Analytics Dashboard", cost: "60,000" },
  { item: "Mobile App (Android)", cost: "80,000" },
  { item: "Admin Panel & Role System", cost: "45,000" },
  { item: "UI/UX Design & Components", cost: "40,000" },
  { item: "Testing, DevOps & Deployment", cost: "35,000" },
  { item: "Ongoing Maintenance (12 months)", cost: "60,000" },
]

const totalBuildCost = 655000

export default function DemoPage() {
  const router = useRouter()
  const [activeFeature, setActiveFeature] = useState(0)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10" />
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-center gap-3 mb-8">
            <Logo size={40} tone="hero" />
            <span className="text-2xl font-semibold tracking-tight">Zaylo</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Your agency.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Powered by AI.
            </span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mb-10">
            A complete real estate platform built for Dubai agencies.
            CRM, AI assistant, owner intelligence, marketplace — everything
            you need to scale, ready to deploy today.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => router.push("/demo/deal")}
              className="px-8 py-4 bg-cyan-500 text-black font-semibold rounded-xl hover:bg-cyan-400 transition-all flex items-center gap-2"
            >
              View Deal Terms <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push("/pipeline")}
              className="px-8 py-4 border border-zinc-700 rounded-xl hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all flex items-center gap-2"
            >
              <Play className="w-5 h-5" /> Live Demo
            </button>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
              <Clock className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-2xl font-bold mb-2">6–12 months</h3>
              <p className="text-zinc-400">of development time saved. Deploy week one, not month twelve.</p>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
              <DollarSign className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-2xl font-bold mb-2">655,000+ AED</h3>
              <p className="text-zinc-400">estimated build cost if developed from scratch with a dev team.</p>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
              <Zap className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Production Ready</h3>
              <p className="text-zinc-400">Not a prototype. Real features, real integrations, real value from day one.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-2">Everything Built In</h2>
          <p className="text-zinc-400 mb-12">10 core modules, ready to customize for your agency.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveFeature(i)
                  if (feature.path !== "#") router.push(feature.path)
                }}
                className={`text-left p-6 rounded-2xl border transition-all hover:border-cyan-500/50 hover:bg-cyan-500/5 ${
                  activeFeature === i ? "border-cyan-500/50 bg-cyan-500/5" : "border-zinc-800 bg-zinc-900/30"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <feature.icon className="w-6 h-6 text-cyan-400" />
                  <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-medium">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-zinc-400">{feature.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Build Cost Breakdown */}
      <section className="border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-2">What This Would Cost to Build</h2>
          <p className="text-zinc-400 mb-10">Estimated development cost at market rates (Dubai/remote dev team).</p>

          <div className="rounded-2xl border border-zinc-800 overflow-hidden">
            {buildCosts.map((item, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-5 ${
                  i !== buildCosts.length - 1 ? "border-b border-zinc-800" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  <span>{item.item}</span>
                </div>
                <span className="text-zinc-400 font-mono">{item.cost} AED</span>
              </div>
            ))}
            <div className="flex items-center justify-between p-5 bg-cyan-500/10 border-t border-cyan-500/20">
              <span className="font-bold text-lg">Total Estimated Cost</span>
              <span className="font-bold text-lg text-cyan-400 font-mono">
                {totalBuildCost.toLocaleString()} AED
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Me */}
      <section className="border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-10">Why This Deal Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "I built it, I know every line",
                desc: "No onboarding. No knowledge transfer. I can customize and extend it instantly.",
              },
              {
                title: "Continuous development included",
                desc: "I join your team and keep building. New features, integrations, whatever you need.",
              },
              {
                title: "Fraction of the cost",
                desc: "You get 655K+ AED worth of software for a fraction of the price, with the developer included.",
              },
              {
                title: "Competitive advantage from day one",
                desc: "While other agencies are shopping for tools, yours is already running on a custom platform.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30">
                <ChevronRight className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-zinc-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to move?</h2>
          <p className="text-zinc-400 mb-8 text-lg">See the deal terms and lets get started.</p>
          <button
            onClick={() => router.push("/demo/deal")}
            className="px-10 py-4 bg-cyan-500 text-black font-semibold rounded-xl hover:bg-cyan-400 transition-all text-lg"
          >
            View Deal Terms
          </button>
        </div>
      </section>

      <footer className="border-t border-zinc-800 py-8 text-center text-sm text-zinc-500">
        Zaylo — Confidential Proposal
      </footer>
    </div>
  )
}
