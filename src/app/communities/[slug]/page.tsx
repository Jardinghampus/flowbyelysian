"use client"

import { useParams } from "next/navigation"
import { useState, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Bed,
  Bath,
  Maximize,
  MapPin,
  TrendingUp,
  TrendingDown,
  Building2,
  Calendar,
  ChevronRight,
  Phone,
  Mail,
  Heart,
  Share2,
  Check,
  Home,
  Trees,
  Waves,
  GraduationCap,
  Train,
  ShoppingBag,
  Dumbbell,
  Shield,
  Palmtree,
} from "lucide-react"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { ChatPopup } from "@/components/landing/chat-popup"
import {
  getCommunityBySlug,
  formatPrice,
  villaCommunities,
  type VillaCommunity,
  type CommunityHighlight,
} from "@/lib/data/villa-communities"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const CHART_COLORS = ["#2563eb", "#0891b2", "#059669", "#d97706", "#dc2626", "#7c3aed"]

function getHighlightIcon(icon: CommunityHighlight["icon"]) {
  const map = {
    golf: <Palmtree className="h-6 w-6" />,
    lagoon: <Waves className="h-6 w-6" />,
    beach: <Waves className="h-6 w-6" />,
    park: <Trees className="h-6 w-6" />,
    school: <GraduationCap className="h-6 w-6" />,
    metro: <Train className="h-6 w-6" />,
    mall: <ShoppingBag className="h-6 w-6" />,
    gym: <Dumbbell className="h-6 w-6" />,
    pool: <Waves className="h-6 w-6" />,
    security: <Shield className="h-6 w-6" />,
  }
  return map[icon] || <Home className="h-6 w-6" />
}

export default function AreaLandingPage() {
  const params = useParams()
  const slug = params.slug as string
  const community = getCommunityBySlug(slug)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const [activeListingFilter, setActiveListingFilter] = useState<"all" | "sale" | "rent">("all")
  const [savedListings, setSavedListings] = useState<Set<string>>(new Set())

  const toggleSave = useCallback((id: string) => {
    setSavedListings((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  if (!community) {
    return (
      <main className="bg-white min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 pt-24">
          <h1 className="text-3xl font-bold mb-4">Area Not Found</h1>
          <p className="text-neutral-600 mb-8">The community you are looking for does not exist.</p>
          <Link href="/communities" className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-white font-semibold hover:bg-neutral-800 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Browse All Communities
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  const filteredListings = activeListingFilter === "all"
    ? community.listings
    : community.listings.filter((l) => l.transactionType === activeListingFilter)

  const otherCommunities = villaCommunities.filter((c) => c.slug !== slug).slice(0, 3)

  return (
    <main className="bg-white">
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <Image
            src={community.heroImage}
            alt={community.name}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 flex h-full flex-col justify-end px-4 pb-16 md:pb-20">
          <div className="mx-auto max-w-7xl w-full">
            <Link href="/communities" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 text-sm">
              <ArrowLeft className="h-4 w-4" /> All Communities
            </Link>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <p className="text-blue-400 font-medium uppercase tracking-widest text-sm mb-3">
                {community.developer} &middot; {community.location}
              </p>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">{community.name}</h1>
              <p className="text-xl md:text-2xl text-white/70 max-w-2xl">{community.tagline}</p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
            >
              <StatPill label="Avg. Price" value={formatPrice(community.stats.avgPrice)} />
              <StatPill label="Price/sqft" value={`AED ${community.marketData.avgPriceSqft.toLocaleString()}`} change={community.marketData.avgPriceSqftChange} />
              <StatPill label="Avg. Yield" value={`${community.marketData.avgRentYield}%`} />
              <StatPill label="Days on Market" value={community.marketData.avgDaysOnMarket.toString()} />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
              <h2 className="text-3xl font-bold text-neutral-900 mb-6">About {community.name}</h2>
              <p className="text-lg text-neutral-600 leading-relaxed">{community.description}</p>

              {/* Sub-communities */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-3">Sub-Communities</h3>
                <div className="flex flex-wrap gap-2">
                  {community.subCommunities.map((sc) => (
                    <span key={sc} className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700">
                      {sc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Facts */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-neutral-50 p-6 md:p-8">
                <h3 className="text-lg font-semibold mb-6">Key Facts</h3>
                <div className="space-y-4">
                  <Fact label="Developer" value={community.developer} />
                  <Fact label="Location" value={community.location} />
                  <Fact label="Established" value={community.established} />
                  <Fact label="Community Size" value={community.stats.communitySize} />
                  <Fact label="Total Units" value={community.stats.totalUnits.toLocaleString()} />
                  <Fact label="Price Range" value={`${formatPrice(community.stats.priceFrom)} - ${formatPrice(community.stats.priceTo)}`} />
                  <Fact label="Avg. Size" value={`${community.stats.avgSize.toLocaleString()} sqft`} />
                  <Fact label="Avg. Rental Yield" value={`${community.marketData.avgRentYield}%`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Highlights */}
      <section className="py-20 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Why {community.name}?</h2>
          <p className="text-lg text-neutral-600 mb-12 max-w-2xl">
            Discover what makes this community one of Dubai&apos;s most desirable addresses.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {community.highlights.map((h, i) => (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl bg-white p-6 border border-neutral-200/60 hover:shadow-lg transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
                  {getHighlightIcon(h.icon)}
                </div>
                <h3 className="text-lg font-semibold mb-2">{h.title}</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">{h.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Data Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Market Statistics</h2>
          <p className="text-lg text-neutral-600 mb-12">Latest market data and trends for {community.name}.</p>

          {/* Market Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <MarketCard
              title="Avg. Price/sqft"
              value={`AED ${community.marketData.avgPriceSqft.toLocaleString()}`}
              change={community.marketData.avgPriceSqftChange}
              subtitle="YoY change"
            />
            <MarketCard
              title="Transactions (YTD)"
              value={community.marketData.totalTransactionsYTD.toLocaleString()}
              change={community.marketData.transactionsChange}
              subtitle="vs last year"
            />
            <MarketCard
              title="Days on Market"
              value={community.marketData.avgDaysOnMarket.toString()}
              subtitle="Average listing duration"
            />
            <MarketCard
              title="Rental Yield"
              value={`${community.marketData.avgRentYield}%`}
              subtitle="Average gross yield"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Price History Chart */}
            <div className="rounded-2xl border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold mb-1">Price Per Sqft Trend</h3>
              <p className="text-sm text-neutral-500 mb-6">Average AED/sqft over the last 6 months</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={community.marketData.priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} tickFormatter={(v) => v.split(" ")[0]} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`AED ${Number(v ?? 0).toLocaleString()}`, "Avg Price/sqft"]} />
                    <Line type="monotone" dataKey="avgPrice" stroke="#2563eb" strokeWidth={2.5} dot={{ fill: "#2563eb", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Transaction Volume Chart */}
            <div className="rounded-2xl border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold mb-1">Transaction Volume</h3>
              <p className="text-sm text-neutral-500 mb-6">Monthly transaction count</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={community.marketData.priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} tickFormatter={(v) => v.split(" ")[0]} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [v ?? 0, "Transactions"]} />
                    <Bar dataKey="transactions" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Property Type Breakdown */}
            <div className="rounded-2xl border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold mb-1">Property Type Mix</h3>
              <p className="text-sm text-neutral-500 mb-6">Distribution by property type</p>
              <div className="h-64 flex items-center">
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={community.marketData.propertyTypeBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="percentage"
                        nameKey="type"
                      >
                        {community.marketData.propertyTypeBreakdown.map((_entry, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v ?? 0}%`, "Share"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-3">
                  {community.marketData.propertyTypeBreakdown.map((t, i) => (
                    <div key={t.type} className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{t.type}</p>
                        <p className="text-xs text-neutral-500">{t.percentage}% &middot; {formatPrice(t.avgPrice)} avg</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rental Yields */}
            <div className="rounded-2xl border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold mb-1">Rental Yields</h3>
              <p className="text-sm text-neutral-500 mb-6">Gross rental yield by property type</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={community.marketData.rentalYields} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} domain={[0, 'auto']} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="type" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip formatter={(v) => [`${v ?? 0}%`, "Yield"]} />
                    <Bar dataKey="yield" fill="#059669" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Price Ranges Table */}
          <div className="mt-12 rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="p-6 border-b border-neutral-200">
              <h3 className="text-lg font-semibold">Price Guide</h3>
              <p className="text-sm text-neutral-500">Indicative pricing by property type and bedrooms</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 text-left text-sm font-medium text-neutral-500">
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Bedrooms</th>
                    <th className="px-6 py-3">From</th>
                    <th className="px-6 py-3">Average</th>
                    <th className="px-6 py-3">To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {community.marketData.priceRanges.map((r, i) => (
                    <tr key={i} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">{r.type}</td>
                      <td className="px-6 py-4 text-sm">{r.bedrooms}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{formatPrice(r.minPrice)}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{formatPrice(r.avgPrice)}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{formatPrice(r.maxPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Listings Section */}
      <section className="py-20 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900">Available Properties</h2>
              <p className="text-neutral-600 mt-1">{community.listings.length} properties in {community.name}</p>
            </div>
            <div className="flex gap-2">
              {(["all", "sale", "rent"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveListingFilter(f)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                    activeListingFilter === f
                      ? "bg-neutral-900 text-white"
                      : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
                  }`}
                >
                  {f === "all" ? "All" : f === "sale" ? "For Sale" : "For Rent"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {filteredListings.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group rounded-2xl bg-white border border-neutral-200/60 overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={listing.image}
                    alt={listing.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      listing.transactionType === "sale" ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"
                    }`}>
                      {listing.transactionType === "sale" ? "For Sale" : "For Rent"}
                    </span>
                    {listing.isNew && (
                      <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">New</span>
                    )}
                    {listing.subType && (
                      <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-neutral-700">
                        {listing.subType}
                      </span>
                    )}
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => toggleSave(listing.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
                    >
                      <Heart className={`h-4 w-4 ${savedListings.has(listing.id) ? "fill-red-500 text-red-500" : "text-neutral-600"}`} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{listing.title}</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-4">
                    {formatPrice(listing.price)}
                    {listing.transactionType === "rent" && <span className="text-sm font-normal text-neutral-500">/year</span>}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-neutral-600 mb-4">
                    <span className="flex items-center gap-1"><Bed className="h-4 w-4" /> {listing.bedrooms} BR</span>
                    <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {listing.bathrooms} BA</span>
                    <span className="flex items-center gap-1"><Maximize className="h-4 w-4" /> {listing.size.toLocaleString()} sqft</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {listing.features.map((f) => (
                      <span key={f} className="flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600">
                        <Check className="h-3 w-3 text-green-600" />
                        {f}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                    <span className="text-sm text-neutral-500">
                      AED {listing.pricePerSqft.toLocaleString()}/sqft
                    </span>
                    <Link
                      href={`/properties?area=${community.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      View Details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-12 rounded-2xl bg-white border border-neutral-200/60">
              <Building2 className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-neutral-900">No {activeListingFilter === "rent" ? "rental" : "sale"} properties currently listed</p>
              <p className="text-neutral-600 mt-1">Check back soon or contact us for off-market options.</p>
            </div>
          )}
        </div>
      </section>

      {/* Nearby Amenities */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">Nearby Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {community.nearbyAmenities.map((a) => (
              <div key={a} className="flex items-center gap-3 rounded-xl bg-neutral-50 p-4">
                <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm font-medium">{a}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-neutral-900 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Interested in {community.name}?
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
            Get expert advice, off-market listings, and personalized property recommendations from our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+971501234567"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-white font-semibold hover:bg-blue-500 transition-colors"
            >
              <Phone className="h-5 w-5" />
              Call Our Team
            </a>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              <Mail className="h-5 w-5" />
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Other Communities */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">Explore Other Communities</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {otherCommunities.map((c) => (
              <Link
                key={c.slug}
                href={`/communities/${c.slug}`}
                className="group rounded-2xl overflow-hidden border border-neutral-200/60 hover:shadow-xl transition-all"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={c.heroImage}
                    alt={c.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-bold text-white">{c.name}</h3>
                    <p className="text-white/70 text-sm">{c.developer}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">From {formatPrice(c.stats.priceFrom)}</span>
                    <span className="text-blue-600 font-medium flex items-center gap-1">
                      Explore <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <ChatPopup />
    </main>
  )
}

function StatPill({ label, value, change }: { label: string; value: string; change?: number }) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/10 px-4 py-3">
      <p className="text-sm text-white/60">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-lg md:text-xl font-bold text-white">{value}</p>
        {change !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
            {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change >= 0 ? "+" : ""}{change}%
          </span>
        )}
      </div>
    </div>
  )
}

function MarketCard({ title, value, change, subtitle }: { title: string; value: string; change?: number; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-5">
      <p className="text-sm text-neutral-500 mb-1">{title}</p>
      <div className="flex items-center gap-2 mb-1">
        <p className="text-2xl font-bold">{value}</p>
        {change !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold rounded-full px-2 py-0.5 ${
            change >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change >= 0 ? "+" : ""}{change}%
          </span>
        )}
      </div>
      <p className="text-xs text-neutral-500">{subtitle}</p>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 pb-3 border-b border-neutral-200 last:border-0 last:pb-0">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  )
}
