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
  {
    id: "5",
    title: "Emirates Hills Mansion",
    location: "Emirates Hills",
    price: 45000000,
    priceLabel: "AED 45M",
    bedrooms: 7,
    bathrooms: 8,
    size: 12000,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2670&auto=format&fit=crop",
    type: "Mansion",
  },
  {
    id: "6",
    title: "JBR Beachfront Apartment",
    location: "JBR",
    price: 3200000,
    priceLabel: "AED 3.2M",
    bedrooms: 2,
    bathrooms: 2,
    size: 1450,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2670&auto=format&fit=crop",
    type: "Apartment",
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
  const mainListing = featuredListings[0]
  const topRow = featuredListings.slice(1, 3)
  const bottomRow = featuredListings.slice(3, 6)

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
        >
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">
              Exclusive Properties
            </p>
            <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl lg:text-5xl">
              Featured Listings
            </h2>
          </div>
          <Link
            href="/inventory"
            className="inline-flex items-center text-neutral-900 font-medium hover:text-blue-600 transition-colors"
          >
            View All Properties
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </motion.div>

        {/* Listings Grid - 1 big + 2 top + 3 bottom */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5"
        >
          {/* Main Featured Listing - Left Column */}
          <motion.div
            variants={itemVariants}
            className="lg:row-span-2 group cursor-pointer"
          >
            <Link href={`/inventory?id=${mainListing.id}`}>
              <div className="relative overflow-hidden rounded-2xl bg-neutral-100 h-full">
                <div className="relative aspect-[3/4] lg:aspect-auto lg:h-full min-h-[500px]">
                  <Image
                    src={mainListing.image}
                    alt={mainListing.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Featured Badge */}
                  <div className="absolute top-4 left-4 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white">
                    Featured
                  </div>

                  {/* Type Badge */}
                  <div className="absolute top-4 right-4 rounded-full bg-white/95 backdrop-blur px-3 py-1 text-xs font-medium text-neutral-900">
                    {mainListing.type}
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                      <MapPin className="h-3.5 w-3.5" />
                      {mainListing.location}
                    </div>
                    <h3 className="font-bold text-white text-2xl md:text-3xl mb-4">
                      {mainListing.title}
                    </h3>

                    {/* Property Details */}
                    <div className="flex items-center gap-4 text-white/90 text-sm mb-4">
                      <div className="flex items-center gap-1.5">
                        <Bed className="h-4 w-4" />
                        <span>{mainListing.bedrooms} Beds</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bath className="h-4 w-4" />
                        <span>{mainListing.bathrooms} Baths</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Maximize className="h-4 w-4" />
                        <span>{mainListing.size.toLocaleString()} sqft</span>
                      </div>
                    </div>

                    {/* Price */}
                    <p className="font-bold text-white text-2xl">
                      {mainListing.priceLabel}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Top Row - 2 Cards */}
          {topRow.map((listing) => (
            <motion.div
              key={listing.id}
              variants={itemVariants}
              className="group cursor-pointer"
            >
              <Link href={`/inventory?id=${listing.id}`}>
                <div className="relative overflow-hidden rounded-2xl bg-neutral-100 h-full">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={listing.image}
                      alt={listing.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Type Badge */}
                    <div className="absolute top-3 right-3 rounded-full bg-white/95 backdrop-blur px-3 py-1 text-xs font-medium text-neutral-900">
                      {listing.type}
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-1.5 text-white/80 text-xs mb-1">
                        <MapPin className="h-3 w-3" />
                        {listing.location}
                      </div>
                      <h3 className="font-semibold text-white text-base mb-2 line-clamp-1">
                        {listing.title}
                      </h3>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-white/80 text-xs">
                          <span>{listing.bedrooms} Beds</span>
                          <span>{listing.bathrooms} Baths</span>
                        </div>
                        <p className="font-bold text-white text-lg">
                          {listing.priceLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Bottom Row - 3 Cards */}
          {bottomRow.map((listing) => (
            <motion.div
              key={listing.id}
              variants={itemVariants}
              className="group cursor-pointer"
            >
              <Link href={`/inventory?id=${listing.id}`}>
                <div className="relative overflow-hidden rounded-2xl bg-neutral-100 h-full">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={listing.image}
                      alt={listing.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Type Badge */}
                    <div className="absolute top-3 right-3 rounded-full bg-white/95 backdrop-blur px-3 py-1 text-xs font-medium text-neutral-900">
                      {listing.type}
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-1.5 text-white/80 text-xs mb-1">
                        <MapPin className="h-3 w-3" />
                        {listing.location}
                      </div>
                      <h3 className="font-semibold text-white text-base mb-2 line-clamp-1">
                        {listing.title}
                      </h3>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-white/80 text-xs">
                          <span>{listing.bedrooms} Beds</span>
                          <span>{listing.bathrooms} Baths</span>
                        </div>
                        <p className="font-bold text-white text-lg">
                          {listing.priceLabel}
                        </p>
                      </div>
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
