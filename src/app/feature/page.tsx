"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Brain,
  MessageSquare,
  FileText,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  Target,
  Sparkles,
  Building2,
  Phone,
  Mail,
  Calendar,
  Bot,
  Search,
  Globe,
  Smartphone
} from "lucide-react"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { ChatPopup } from "@/components/landing/chat-popup"
import { MobileMenuProvider } from "@/contexts/mobile-menu-context"

// WhatsApp Icon Component
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

// Hero Section
function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-blue-900">
      {/* Animated Background Pattern */}
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neutral-900/80" />
      </motion.div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 100 }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              y: [-20, 20, -20],
              x: [0, 10, 0]
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 0.5
            }}
            className="absolute rounded-full bg-blue-500/10 blur-3xl"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              left: `${10 + i * 20}%`,
              top: `${20 + i * 15}%`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-24 text-center text-white"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-300 backdrop-blur-sm border border-blue-500/30"
        >
          <Sparkles className="h-4 w-4" />
          AI-Powered Real Estate Platform
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-6 max-w-5xl"
        >
          <span className="block text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
            Transform Your
          </span>
          <span className="block text-4xl font-bold leading-[1.1] tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent md:text-6xl lg:text-7xl mt-2">
            Real Estate Operations
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-10 max-w-2xl text-lg text-white/70 md:text-xl"
        >
          Empower your agents with AI document intelligence, WhatsApp automation,
          and real-time analytics. Increase productivity by 3x while reducing operational costs.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/app/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-white font-semibold hover:bg-blue-500 transition-all hover:scale-105"
          >
            Try Platform Demo
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center justify-center rounded-full border-2 border-white/20 px-8 py-4 text-white font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
          >
            Explore Features
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16"
        >
          <Stat value="85%" label="Time Saved on Documents" />
          <Stat value="3x" label="Agent Productivity" />
          <Stat value="40%" label="Faster Deal Closure" />
          <Stat value="98%" label="Client Satisfaction" />
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center"
        >
          <span className="text-xs uppercase tracking-widest text-white/70 mb-3">
            Discover More
          </span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center text-white">
      <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">{value}</p>
      <p className="text-sm text-white/60 mt-1">{label}</p>
    </div>
  )
}

// Problem Section
function ProblemSection() {
  const problems = [
    {
      icon: FileText,
      title: "Manual Document Processing",
      description: "Agents spend hours extracting data from floor plans, contracts, and brochures manually",
      stat: "6+ hours/week",
    },
    {
      icon: MessageSquare,
      title: "Fragmented Communication",
      description: "Client conversations scattered across multiple channels with no unified tracking",
      stat: "30% leads lost",
    },
    {
      icon: BarChart3,
      title: "No Performance Visibility",
      description: "Managers lack real-time insights into team performance and deal pipelines",
      stat: "Blind decisions",
    },
  ]

  return (
    <section className="py-24 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">
            The Challenge
          </p>
          <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl mb-4">
            Real Estate Operations Are Stuck in the Past
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Traditional workflows drain productivity, lose clients, and leave money on the table
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-100 text-red-600 mb-6">
                <problem.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">{problem.title}</h3>
              <p className="text-neutral-600 mb-4">{problem.description}</p>
              <div className="inline-flex items-center gap-2 text-red-600 font-semibold">
                <Clock className="h-4 w-4" />
                {problem.stat}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Smart Document Intelligence Section
function DocumentIntelligenceSection() {
  const features = [
    {
      title: "Instant Data Extraction",
      description: "AI automatically extracts property specs, dimensions, and features from any document",
      icon: Zap,
    },
    {
      title: "Document Comparison",
      description: "Compare multiple floor plans, specs, or contracts side-by-side with AI analysis",
      icon: FileText,
    },
    {
      title: "Smart Search",
      description: "Find any property detail across thousands of documents in seconds",
      icon: Search,
    },
    {
      title: "AI Chat Assistant",
      description: "Ask questions about your documents and get instant, accurate answers",
      icon: Bot,
    },
  ]

  const extractedData = [
    "Plot Size: 12,000 sq ft",
    "Built-up Area: 8,500 sq ft",
    "Bedrooms: 5 + Maid Room",
    "Parking: 3 Cars",
    "Pool: Private Infinity",
    "Garden: 2,500 sq ft",
  ]

  return (
    <section id="features" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-600 mb-4">
            <Brain className="h-4 w-4" />
            AI-Powered
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 md:text-5xl mb-4">
            Smart Document Intelligence
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Upload floor plans, contracts, and brochures. Our AI extracts every detail automatically,
            saving hours of manual work.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Demo Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="ml-2 text-sm text-neutral-400">Document Analysis</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Document Preview */}
                <div className="bg-neutral-800 rounded-lg p-4">
                  <div className="aspect-[3/4] bg-neutral-700 rounded-lg flex items-center justify-center mb-3">
                    <FileText className="h-12 w-12 text-neutral-500" />
                  </div>
                  <p className="text-sm text-neutral-300">Villa_FloorPlan.pdf</p>
                  <p className="text-xs text-neutral-500">Processing complete</p>
                </div>

                {/* Extracted Data */}
                <div className="bg-neutral-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-400 mb-3">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">AI Extracted</span>
                  </div>
                  <div className="space-y-2">
                    {extractedData.map((item) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: 10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-xs text-neutral-300 bg-neutral-700/50 rounded px-2 py-1"
                      >
                        {item}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Chat */}
              <div className="mt-4 bg-neutral-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-neutral-700 rounded-lg p-3 text-sm text-neutral-200">
                    This villa features a 12,000 sq ft plot with an 8,500 sq ft built-up area.
                    It includes 5 bedrooms, a maid room, private infinity pool, and a 2,500 sq ft garden.
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="absolute -bottom-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              85% Time Saved
            </motion.div>
          </motion.div>

          {/* Right: Features */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 p-4 rounded-xl hover:bg-neutral-50 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 flex-shrink-0">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">{feature.title}</h3>
                  <p className="text-neutral-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}

            <div className="pt-4">
              <Link
                href="/app/smart"
                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all"
              >
                Try Document Intelligence
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// WhatsApp Integration Section
function WhatsAppSection() {
  const features = [
    {
      title: "One-Click WhatsApp",
      description: "Connect with clients instantly from any property listing or contact card",
      icon: Smartphone,
    },
    {
      title: "Team Visibility",
      description: "See your entire team's contact activities and follow-up status in real-time",
      icon: Users,
    },
    {
      title: "Smart Reminders",
      description: "AI suggests optimal follow-up times based on client engagement patterns",
      icon: Calendar,
    },
    {
      title: "Unified Inbox",
      description: "All communications - calls, emails, and messages - in one dashboard",
      icon: MessageSquare,
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700 mb-4">
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp Integrated
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 md:text-5xl mb-4">
              WhatsApp-First Client Communication
            </h2>
            <p className="text-lg text-neutral-600 mb-8">
              Your clients live on WhatsApp. Now your entire team can reach them with one click,
              while maintaining full visibility and tracking.
            </p>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700 flex-shrink-0">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{feature.title}</h3>
                    <p className="text-sm text-neutral-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-neutral-200">
              {/* Team Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-neutral-900">Team Activity</h3>
                <span className="text-sm text-green-600 font-medium">Live</span>
              </div>

              {/* Agent Cards */}
              <div className="space-y-4">
                {[
                  { name: "Sarah Johnson", status: "Just messaged Ahmed Al Maktoum", time: "2m ago", avatar: "S" },
                  { name: "Mohammed Ali", status: "Scheduled viewing via WhatsApp", time: "5m ago", avatar: "M" },
                  { name: "Emma Wilson", status: "Sent property brochure", time: "12m ago", avatar: "E" },
                ].map((agent, index) => (
                  <motion.div
                    key={agent.name}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl"
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                      {agent.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">{agent.name}</p>
                      <p className="text-sm text-neutral-500">{agent.status}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400">{agent.time}</span>
                      <WhatsAppIcon className="h-5 w-5 text-green-600" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <button className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                  <WhatsAppIcon className="h-6 w-6 text-green-600" />
                  <span className="text-xs font-medium text-green-700">WhatsApp</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                  <Phone className="h-6 w-6 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">Call</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                  <Mail className="h-6 w-6 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">Email</span>
                </button>
              </div>
            </div>

            {/* Floating Stats */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="absolute -bottom-4 -left-4 bg-green-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              30% More Responses
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Agent Productivity Section
function AgentProductivitySection() {
  const metrics = [
    {
      icon: Clock,
      value: "6 hrs",
      label: "Saved per agent weekly",
      description: "Automated document processing and data entry",
    },
    {
      icon: TrendingUp,
      value: "3x",
      label: "More client touchpoints",
      description: "WhatsApp integration enables faster follow-ups",
    },
    {
      icon: Target,
      value: "40%",
      label: "Faster deal closure",
      description: "AI insights help prioritize hot leads",
    },
    {
      icon: Users,
      value: "2x",
      label: "Team capacity",
      description: "Handle more listings without more staff",
    },
  ]

  return (
    <section className="py-24 bg-neutral-900 text-white">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-300 mb-4">
            <TrendingUp className="h-4 w-4" />
            Agent Performance
          </div>
          <h2 className="text-3xl font-bold md:text-5xl mb-4">
            Supercharge Agent Productivity
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Give your agents the tools to close more deals with less effort.
            See measurable improvements from day one.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 mb-4">
                <metric.icon className="h-6 w-6" />
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
                {metric.value}
              </p>
              <p className="font-semibold text-white mb-1">{metric.label}</p>
              <p className="text-sm text-white/60">{metric.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border border-white/10"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              AK
            </div>
            <div>
              <blockquote className="text-xl text-white/90 mb-4">
                &ldquo;We used to spend entire days processing floor plans and contracts.
                Now our AI does it in seconds. Our team can focus on what matters - building client relationships.&rdquo;
              </blockquote>
              <div>
                <p className="font-semibold text-white">Ahmed Al Khouri</p>
                <p className="text-sm text-white/60">Sales Director, Zaylo</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ROI Section
function ROISection() {
  const roiItems = [
    {
      title: "Reduced Operational Costs",
      description: "Automate manual tasks and eliminate redundant processes",
      value: "-35%",
      icon: DollarSign,
    },
    {
      title: "Increased Deal Volume",
      description: "Handle more transactions with the same team size",
      value: "+50%",
      icon: TrendingUp,
    },
    {
      title: "Better Lead Conversion",
      description: "AI prioritization and faster response times",
      value: "+25%",
      icon: Target,
    },
    {
      title: "Client Retention",
      description: "Superior service through unified communication",
      value: "98%",
      icon: Shield,
    },
  ]

  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700 mb-4">
              <BarChart3 className="h-4 w-4" />
              For Investors & Leadership
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 md:text-5xl mb-4">
              Measurable ROI From Day One
            </h2>
            <p className="text-lg text-neutral-600 mb-8">
              ZFlow delivers quantifiable returns across every metric that matters.
              See the impact on your bottom line with clear, trackable KPIs.
            </p>

            <div className="space-y-6">
              {roiItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-neutral-50 rounded-xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700 flex-shrink-0">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-neutral-900">{item.title}</h3>
                      <span className="text-xl font-bold text-green-600">{item.value}</span>
                    </div>
                    <p className="text-sm text-neutral-600">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Calculator Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-8 text-white shadow-2xl">
              <h3 className="text-xl font-semibold mb-6">Annual Value Calculator</h3>

              <div className="space-y-6">
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white/70">Team Size</span>
                  <span className="font-semibold">20 Agents</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white/70">Hours Saved/Agent/Week</span>
                  <span className="font-semibold">6 hours</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white/70">Annual Hours Saved</span>
                  <span className="font-semibold">6,240 hours</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white/70">Agent Hourly Value</span>
                  <span className="font-semibold">AED 150</span>
                </div>

                <div className="pt-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 -mx-8 px-8 py-6 rounded-b-2xl -mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Annual Value Created</span>
                    <span className="text-3xl font-bold text-green-400">AED 936,000</span>
                  </div>
                  <p className="text-sm text-white/60 mt-2">
                    Based on time savings alone. Additional value from increased conversions not included.
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="absolute -top-4 -right-4 bg-blue-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              10x ROI
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Platform Overview Section
function PlatformOverviewSection() {
  const tools = [
    { icon: Brain, name: "Smart Docs", description: "AI Document Intelligence" },
    { icon: Building2, name: "Inventory", description: "Property Management" },
    { icon: BarChart3, name: "Analytics", description: "Performance Tracking" },
    { icon: Users, name: "CRM", description: "Contact Management" },
    { icon: Mail, name: "Email", description: "Gmail Integration" },
    { icon: Calendar, name: "Calendar", description: "Scheduling" },
    { icon: Bot, name: "AI Chat", description: "Smart Assistant" },
    { icon: Globe, name: "SEO", description: "Content Generator" },
  ]

  return (
    <section className="py-24 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-neutral-900 md:text-5xl mb-4">
            Everything Your Team Needs
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            One unified platform replacing scattered tools. Everything works together seamlessly.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-lg hover:border-blue-200 transition-all text-center group"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors mx-auto mb-4">
                <tool.icon className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1">{tool.name}</h3>
              <p className="text-sm text-neutral-500">{tool.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Integration Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-neutral-400 mb-8">
            Integrates With
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {["Google Workspace", "WhatsApp Business", "PropertyFinder", "Bayut", "CRM Systems"].map((integration) => (
              <div key={integration} className="text-neutral-400 font-medium">
                {integration}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// CTA Section
function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold md:text-5xl mb-6">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Join leading real estate companies already using Flow to supercharge their teams.
            Schedule a demo and see the platform in action.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/app/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-blue-600 font-semibold hover:bg-neutral-100 transition-colors"
            >
              Start Free Demo
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="https://wa.me/971501234567?text=Hi%2C%20I%27d%20like%20to%20schedule%20a%20demo%20of%20Flow"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 text-white font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Chat With Us
            </a>
          </div>

          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/60">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Free 14-day trial
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Setup in 5 minutes
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Main Page
export default function FeaturePage() {
  return (
    <MobileMenuProvider>
    <main className="bg-white">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <DocumentIntelligenceSection />
      <WhatsAppSection />
      <AgentProductivitySection />
      <ROISection />
      <PlatformOverviewSection />
      <CTASection />
      <Footer />
      <ChatPopup />
    </main>
    </MobileMenuProvider>
  )
}
