"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Bed, Bath, Maximize, MapPin } from "lucide-react"

interface Listing {
  id: string
  title: string
  location: string
  price: number
  priceLabel: string
  bedrooms: number
  bathrooms: number
  size: number
  image: string
  featured?: boolean
  type: string
}

const featuredListings: Listing[] = [
  {
    id: "1",
    title: "Beachfront Villa with Private Beach",
    location: "Palm Jumeirah",
    price: 25000000,
    priceLabel: "AED 25M",
    bedrooms: 6,
    bathrooms: 7,
    size: 8500,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop",
    featured: true,
    type: "Villa",
  },
  {
    id: "2",
    title: "Luxury Penthouse with Burj View",
    location: "Downtown Dubai",
    price: 15000000,
    priceLabel: "AED 15M",
    bedrooms: 4,
    bathrooms: 5,
    size: 5200,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2675&auto=format&fit=crop",
    type: "Penthouse",
  },
  {
    id: "3",
    title: "Marina Skyline Apartment",
    location: "Dubai Marina",
    price: 4500000,
    priceLabel: "AED 4.5M",
    bedrooms: 3,
    bathrooms: 3,
    size: 2100,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop",
    type: "Apartment",
  },
  {
    id: "4",
    title: "Modern Lagoon Villa",
    location: "Tilal Al Ghaf",
    price: 8500000,
    priceLabel: "AED 8.5M",
    bedrooms: 5,
    bathrooms: 6,
    size: 5800,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop",
    type: "Villa",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
}

export function FeaturedListings() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-amber-600">
              Exclusive Properties
            </p>
            <h2 className="text-4xl font-bold text-neutral-900 md:text-5xl">
              Featured Listings
            </h2>
          </div>
          <Link
            href="/inventory"
            className="mt-6 inline-flex items-center text-neutral-900 font-medium hover:text-amber-600 transition-colors md:mt-0"
          >
            View All Properties
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </motion.div>

        {/* Listings Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {featuredListings.map((listing, index) => (
            <motion.div
              key={listing.id}
              variants={itemVariants}
              className={`group cursor-pointer ${
                index === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <Link href={`/inventory?id=${listing.id}`}>
                <div className="relative overflow-hidden rounded-2xl bg-neutral-100">
                  <div
                    className={`relative ${
                      index === 0 ? "aspect-[4/3] md:aspect-[4/5]" : "aspect-[4/3]"
                    }`}
                  >
                    <Image
                      src={listing.image}
                      alt={listing.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Badge */}
                    {listing.featured && (
                      <div className="absolute top-4 left-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                        Featured
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-4 right-4 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-medium text-neutral-900">
                      {listing.type}
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                        <MapPin className="h-3.5 w-3.5" />
                        {listing.location}
                      </div>
                      <h3
                        className={`font-bold text-white mb-3 ${
                          index === 0 ? "text-2xl md:text-3xl" : "text-lg"
                        }`}
                      >
                        {listing.title}
                      </h3>

                      {/* Property Details */}
                      <div className="flex items-center gap-4 text-white/90 text-sm mb-4">
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          <span>{listing.bedrooms}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          <span>{listing.bathrooms}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Maximize className="h-4 w-4" />
                          <span>{listing.size.toLocaleString()} sqft</span>
                        </div>
                      </div>

                      {/* Price */}
                      <p
                        className={`font-bold text-white ${
                          index === 0 ? "text-2xl" : "text-xl"
                        }`}
                      >
                        {listing.priceLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
