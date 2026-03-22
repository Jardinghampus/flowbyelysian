"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"
import { ArrowUpRight } from "lucide-react"

interface Area {
  id: string
  name: string
  slug: string
  description: string
  image: string
  propertyCount: number
  avgPrice: string
}

const areas: Area[] = [
  {
    id: "1",
    name: "Palm Jumeirah",
    slug: "palm-jumeirah",
    description: "The iconic man-made island featuring ultra-luxury villas and world-class beachfront living.",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2670&auto=format&fit=crop",
    propertyCount: 124,
    avgPrice: "AED 3,500/sqft",
  },
  {
    id: "2",
    name: "Dubai Marina",
    slug: "dubai-marina",
    description: "A stunning waterfront community with luxury high-rises and vibrant dining and entertainment.",
    image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=2574&auto=format&fit=crop",
    propertyCount: 256,
    avgPrice: "AED 1,650/sqft",
  },
  {
    id: "3",
    name: "Premium Villa Communities",
    slug: "villa-communities",
    description: "Exclusive gated communities including Emirates Hills, Arabian Ranches, and Tilal Al Ghaf.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2675&auto=format&fit=crop",
    propertyCount: 89,
    avgPrice: "AED 1,850/sqft",
  },
]

export function AreasSection() {
  return (
    <section className="py-28 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Where We Work
          </p>
          <h2 className="text-4xl font-bold text-neutral-900 md:text-5xl mb-4 tracking-tight">
            Dubai&apos;s Most Prestigious Addresses
          </h2>
          <p className="max-w-2xl text-lg text-neutral-500 leading-relaxed">
            We specialize in the most sought-after locations in Dubai, from iconic waterfront living to exclusive villa communities.
          </p>
        </motion.div>

        {/* Areas */}
        <div className="space-y-32">
          {areas.map((area, index) => (
            <AreaCard key={area.id} area={area} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function AreaCard({ area, index }: { area: Area; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8])

  const isEven = index % 2 === 0

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      className={`grid gap-8 lg:grid-cols-2 items-center ${
        isEven ? "" : "lg:grid-flow-dense"
      }`}
    >
      {/* Image */}
      <motion.div
        style={{ y, scale }}
        className={`relative ${isEven ? "" : "lg:col-start-2"}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl group">
          <Image
            src={area.image}
            alt={area.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          {/* Stats Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div className="text-white">
              <p className="text-3xl font-bold tracking-tight">{area.propertyCount}+</p>
              <p className="text-white/60 text-sm">Active Listings</p>
            </div>
            <div className="text-white text-right">
              <p className="text-xl font-semibold tracking-tight">{area.avgPrice}</p>
              <p className="text-white/60 text-sm">Avg. Price</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? 50 : -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={isEven ? "" : "lg:col-start-1 lg:row-start-1"}
      >
        <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">
          {area.name}
        </h3>
        <p className="text-lg text-neutral-500 mb-8 leading-relaxed">
          {area.description}
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/areas/${area.slug}`}
            className="group inline-flex items-center justify-center rounded-full bg-neutral-900 px-8 py-4 text-white font-medium hover:bg-neutral-800 transition-all duration-200 hover:shadow-lg"
          >
            Explore {area.name}
            <ArrowUpRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            href={`/inventory?area=${area.slug}`}
            className="inline-flex items-center justify-center rounded-full border border-neutral-200 px-8 py-4 text-neutral-900 font-medium hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200"
          >
            View Properties
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Horizontal Scroll Gallery Component for additional areas
export function AreaGallery() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"])

  const additionalAreas = [
    {
      name: "Downtown Dubai",
      image: "https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=2574&auto=format&fit=crop",
    },
    {
      name: "Emirates Hills",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop",
    },
    {
      name: "JBR",
      image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2596&auto=format&fit=crop",
    },
    {
      name: "Business Bay",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop",
    },
    {
      name: "Arabian Ranches",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop",
    },
  ]

  return (
    <section ref={containerRef} className="py-24 bg-neutral-50 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Also Serving
          </p>
          <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl tracking-tight">
            More Premium Locations
          </h2>
        </motion.div>
      </div>

      <motion.div style={{ x }} className="flex gap-5 pl-4">
        {additionalAreas.map((area, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="relative flex-shrink-0 w-[340px] aspect-[4/5] rounded-2xl overflow-hidden group cursor-pointer"
          >
            <Image
              src={area.image}
              alt={area.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="text-2xl font-bold text-white tracking-tight">{area.name}</h3>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
