"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, TrendingUp, MapPin, Building2, Calendar } from "lucide-react"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { ChatPopup } from "@/components/landing/chat-popup"
import { villaCommunities, formatPrice } from "@/lib/data/villa-communities"

export default function AreasIndexPage() {
  return (
    <main className="bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-neutral-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2670&auto=format&fit=crop"
            alt="Dubai Skyline"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-blue-400 font-medium uppercase tracking-widest text-sm mb-4">
              Dubai Villa Communities
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Explore Premium Communities
            </h1>
            <p className="text-xl text-white/70 max-w-2xl">
              From golf course estates to waterfront villas, discover Dubai&apos;s most prestigious villa communities with detailed market data and available properties.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/10 p-4">
              <p className="text-3xl font-bold">6</p>
              <p className="text-sm text-white/60">Premium Communities</p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/10 p-4">
              <p className="text-3xl font-bold">50K+</p>
              <p className="text-sm text-white/60">Total Units</p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/10 p-4">
              <p className="text-3xl font-bold">5.6%</p>
              <p className="text-sm text-white/60">Avg Rental Yield</p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/10 p-4">
              <p className="text-3xl font-bold">13K+</p>
              <p className="text-sm text-white/60">YTD Transactions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Communities Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8">
            {villaCommunities.map((community, i) => (
              <motion.div
                key={community.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Link href={`/communities/${community.slug}`} className="group block">
                  <div className="grid lg:grid-cols-5 gap-0 rounded-2xl overflow-hidden border border-neutral-200/60 hover:shadow-2xl transition-all duration-300">
                    {/* Image */}
                    <div className="relative lg:col-span-2 h-64 lg:h-full min-h-[280px] overflow-hidden">
                      <Image
                        src={community.heroImage}
                        alt={community.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-transparent" />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-neutral-700">
                          {community.developer}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3 p-6 md:p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h2 className="text-2xl md:text-3xl font-bold group-hover:text-blue-600 transition-colors">
                              {community.name}
                            </h2>
                            <p className="text-neutral-500 flex items-center gap-1 mt-1">
                              <MapPin className="h-4 w-4" /> {community.location}
                            </p>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        </div>

                        <p className="text-neutral-600 leading-relaxed line-clamp-2 mb-6">
                          {community.tagline}. {community.description.substring(0, 150)}...
                        </p>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">From</p>
                            <p className="text-lg font-bold">{formatPrice(community.stats.priceFrom)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Avg Price/sqft</p>
                            <div className="flex items-center gap-1">
                              <p className="text-lg font-bold">AED {community.marketData.avgPriceSqft.toLocaleString()}</p>
                              <span className="flex items-center gap-0.5 text-xs font-medium text-green-600">
                                <TrendingUp className="h-3 w-3" />
                                +{community.marketData.avgPriceSqftChange}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Yield</p>
                            <p className="text-lg font-bold">{community.marketData.avgRentYield}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Listed</p>
                            <p className="text-lg font-bold">{community.listings.length} properties</p>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-neutral-100">
                        {community.subCommunities.slice(0, 5).map((sc) => (
                          <span key={sc} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
                            {sc}
                          </span>
                        ))}
                        {community.subCommunities.length > 5 && (
                          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-500">
                            +{community.subCommunities.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-neutral-50">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Can&apos;t find what you&apos;re looking for?</h2>
          <p className="text-lg text-neutral-600 mb-8 max-w-xl mx-auto">
            Create a free account and set up your search criteria. We&apos;ll notify you when matching properties become available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-8 py-4 text-white font-semibold hover:bg-neutral-800 transition-colors"
            >
              Create Free Account
            </Link>
            <a
              href="tel:+971501234567"
              className="inline-flex items-center justify-center rounded-full border-2 border-neutral-900 px-8 py-4 text-neutral-900 font-semibold hover:bg-neutral-900 hover:text-white transition-colors"
            >
              Call Our Team
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <ChatPopup />
    </main>
  )
}
