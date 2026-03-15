"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Bed, Bath, Maximize, MapPin, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Property data
const properties = [
  {
    id: "1",
    title: "Beachfront Villa",
    location: "Palm Jumeirah",
    area: "palm-jumeirah",
    price: 25000000,
    priceLabel: "AED 25M",
    bedrooms: 6,
    bathrooms: 7,
    size: 8500,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop",
    type: "Villa",
  },
  {
    id: "2",
    title: "Penthouse with Burj View",
    location: "Downtown Dubai",
    area: "downtown",
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
    area: "marina",
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
    area: "villa-communities",
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
    area: "villa-communities",
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
    title: "JBR Beachfront Suite",
    location: "JBR",
    area: "marina",
    price: 3200000,
    priceLabel: "AED 3.2M",
    bedrooms: 2,
    bathrooms: 2,
    size: 1450,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2670&auto=format&fit=crop",
    type: "Apartment",
  },
  {
    id: "7",
    title: "Creek Harbour Residence",
    location: "Dubai Creek",
    area: "downtown",
    price: 6800000,
    priceLabel: "AED 6.8M",
    bedrooms: 3,
    bathrooms: 4,
    size: 2800,
    image: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?q=80&w=2670&auto=format&fit=crop",
    type: "Apartment",
  },
  {
    id: "8",
    title: "Palm Signature Villa",
    location: "Palm Jumeirah",
    area: "palm-jumeirah",
    price: 35000000,
    priceLabel: "AED 35M",
    bedrooms: 5,
    bathrooms: 6,
    size: 7200,
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=2692&auto=format&fit=crop",
    type: "Villa",
  },
  {
    id: "9",
    title: "Arabian Ranches Estate",
    location: "Arabian Ranches",
    area: "villa-communities",
    price: 12000000,
    priceLabel: "AED 12M",
    bedrooms: 6,
    bathrooms: 7,
    size: 8000,
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2670&auto=format&fit=crop",
    type: "Villa",
  },
  {
    id: "10",
    title: "DIFC Luxury Loft",
    location: "DIFC",
    area: "downtown",
    price: 5500000,
    priceLabel: "AED 5.5M",
    bedrooms: 2,
    bathrooms: 2,
    size: 1800,
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2670&auto=format&fit=crop",
    type: "Apartment",
  },
  {
    id: "11",
    title: "Bluewaters Penthouse",
    location: "Bluewaters Island",
    area: "marina",
    price: 22000000,
    priceLabel: "AED 22M",
    bedrooms: 4,
    bathrooms: 5,
    size: 4500,
    image: "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?q=80&w=2670&auto=format&fit=crop",
    type: "Penthouse",
  },
  {
    id: "12",
    title: "Jumeirah Golf Villa",
    location: "Jumeirah Golf Estates",
    area: "villa-communities",
    price: 18000000,
    priceLabel: "AED 18M",
    bedrooms: 5,
    bathrooms: 6,
    size: 6500,
    image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=2670&auto=format&fit=crop",
    type: "Villa",
  },
]

// Filter options
const areaFilters = [
  { value: "all", label: "All Areas" },
  { value: "palm-jumeirah", label: "Palm Jumeirah" },
  { value: "downtown", label: "Downtown" },
  { value: "marina", label: "Marina & JBR" },
  { value: "villa-communities", label: "Villa Communities" },
]

const bedroomFilters = [
  { value: "all", label: "Beds" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
  { value: "5", label: "5+" },
]

const budgetFilters = [
  { value: "all", label: "Budget" },
  { value: "5", label: "Under 5M" },
  { value: "10", label: "5-10M" },
  { value: "20", label: "10-20M" },
  { value: "50", label: "20M+" },
]

const typeFilters = [
  { value: "all", label: "Type" },
  { value: "Villa", label: "Villa" },
  { value: "Apartment", label: "Apartment" },
  { value: "Penthouse", label: "Penthouse" },
  { value: "Mansion", label: "Mansion" },
]

export default function PropertiesPage() {
  const [selectedArea, setSelectedArea] = useState("all")
  const [selectedBedrooms, setSelectedBedrooms] = useState("all")
  const [selectedBudget, setSelectedBudget] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      // Area filter
      if (selectedArea !== "all" && property.area !== selectedArea) return false

      // Bedrooms filter
      if (selectedBedrooms !== "all" && property.bedrooms < parseInt(selectedBedrooms)) return false

      // Budget filter
      if (selectedBudget !== "all") {
        const budget = parseInt(selectedBudget)
        if (budget === 5 && property.price >= 5000000) return false
        if (budget === 10 && (property.price < 5000000 || property.price >= 10000000)) return false
        if (budget === 20 && (property.price < 10000000 || property.price >= 20000000)) return false
        if (budget === 50 && property.price < 20000000) return false
      }

      // Type filter
      if (selectedType !== "all" && property.type !== selectedType) return false

      return true
    })
  }, [selectedArea, selectedBedrooms, selectedBudget, selectedType])

  const hasActiveFilters = selectedArea !== "all" || selectedBedrooms !== "all" || selectedBudget !== "all" || selectedType !== "all"

  const clearFilters = () => {
    setSelectedArea("all")
    setSelectedBedrooms("all")
    setSelectedBudget("all")
    setSelectedType("all")
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white font-bold text-lg">
              Z
            </div>
            <span className="text-xl font-bold text-neutral-900">ZAYLO</span>
          </Link>
          <Link
            href="/app/dashboard"
            className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
          >
            Agent Login
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-24 pb-20">
        {/* Title Section */}
        <div className="mx-auto max-w-7xl px-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-medium text-neutral-500 mb-2">Collection</p>
            <h1 className="text-5xl md:text-7xl font-bold text-neutral-900 tracking-tight">
              Properties
            </h1>
          </motion.div>
        </div>

        {/* Filter Bar */}
        <div className="mx-auto max-w-7xl px-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap items-center gap-3"
          >
            {/* Area Filter */}
            <div className="flex flex-wrap gap-2">
              {areaFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedArea(filter.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    selectedArea === filter.value
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-neutral-200 hidden md:block" />

            {/* Bedrooms Filter */}
            <div className="flex gap-2">
              {bedroomFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedBedrooms(filter.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    selectedBedrooms === filter.value
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-neutral-200 hidden md:block" />

            {/* Budget Filter */}
            <div className="flex gap-2">
              {budgetFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedBudget(filter.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    selectedBudget === filter.value
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-neutral-200 hidden md:block" />

            {/* Type Filter */}
            <div className="flex gap-2">
              {typeFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedType(filter.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    selectedType === filter.value
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Clear Filters */}
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results count */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-sm text-neutral-500"
          >
            {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"} found
          </motion.p>
        </div>

        {/* Properties Grid */}
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredId(property.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group cursor-pointer"
                >
                  <Link href={`/properties/${property.id}`}>
                    <div className="relative overflow-hidden rounded-2xl bg-neutral-100">
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={property.image}
                          alt={property.title}
                          fill
                          className={cn(
                            "object-cover transition-transform duration-700",
                            hoveredId === property.id ? "scale-105" : "scale-100"
                          )}
                        />

                        {/* Overlay on hover */}
                        <motion.div
                          initial={false}
                          animate={{
                            opacity: hoveredId === property.id ? 1 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0 bg-black/20"
                        />

                        {/* Arrow indicator */}
                        <motion.div
                          initial={false}
                          animate={{
                            opacity: hoveredId === property.id ? 1 : 0,
                            x: hoveredId === property.id ? 0 : -10,
                            y: hoveredId === property.id ? 0 : 10,
                          }}
                          transition={{ duration: 0.3 }}
                          className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white flex items-center justify-center"
                        >
                          <ArrowUpRight className="h-5 w-5 text-neutral-900" />
                        </motion.div>

                        {/* Type badge */}
                        <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-white/95 backdrop-blur text-xs font-medium text-neutral-900">
                          {property.type}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="font-semibold text-neutral-900 text-lg mb-1 line-clamp-1">
                              {property.title}
                            </h3>
                            <div className="flex items-center gap-1 text-neutral-500 text-sm">
                              <MapPin className="h-3.5 w-3.5" />
                              {property.location}
                            </div>
                          </div>
                          <p className="font-bold text-neutral-900 text-lg whitespace-nowrap">
                            {property.priceLabel}
                          </p>
                        </div>

                        {/* Property details */}
                        <div className="flex items-center gap-4 text-neutral-500 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Bed className="h-4 w-4" />
                            <span>{property.bedrooms}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Bath className="h-4 w-4" />
                            <span>{property.bathrooms}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Maximize className="h-4 w-4" />
                            <span>{property.size.toLocaleString()} sqft</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* No results */}
          <AnimatePresence>
            {filteredProperties.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <p className="text-neutral-500 text-lg mb-4">No properties match your filters</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 rounded-full bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-8">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} Zaylo Marketplace
          </p>
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            Back to Home
          </Link>
        </div>
      </footer>
    </main>
  )
}
