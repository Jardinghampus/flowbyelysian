"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Bed, Bath, Maximize, MapPin } from "lucide-react"

// Register GSAP plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

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
]

export function FeaturedListings() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  const mainListing = featuredListings[0]
  const topRow = featuredListings.slice(1, 3)
  const bottomRow = featuredListings.slice(3, 5)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      )

      // Cards staggered animation
      const cards = cardsRef.current?.querySelectorAll(".listing-card")
      if (cards) {
        gsap.fromTo(
          cards,
          {
            opacity: 0,
            y: 80,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: {
              amount: 0.6,
              from: "start",
            },
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div
          ref={headerRef}
          className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
        >
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
              Exclusive Properties
            </p>
            <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl lg:text-5xl tracking-tight">
              Featured Listings
            </h2>
          </div>
          <Link
            href="/user/marketplace"
            className="group inline-flex items-center text-neutral-900 font-medium hover:text-blue-600 transition-colors"
          >
            View All Properties
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Listings Grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          {/* Main Featured Listing */}
          <div className="listing-card lg:row-span-2 group cursor-pointer">
            <Link href={`/properties/${mainListing.id}`}>
              <div className="relative overflow-hidden rounded-2xl bg-neutral-100 h-full">
                <div className="relative aspect-[3/4] lg:aspect-auto lg:h-full min-h-[500px]">
                  <Image
                    src={mainListing.image}
                    alt={mainListing.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  </div>

                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/25">
                      Featured
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-neutral-900">
                    {mainListing.type}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
                      <MapPin className="h-3.5 w-3.5" />
                      {mainListing.location}
                    </div>
                    <h3 className="font-bold text-white text-2xl md:text-3xl mb-4 tracking-tight">
                      {mainListing.title}
                    </h3>

                    <div className="flex items-center gap-4 text-white/80 text-sm mb-4">
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

                    <p className="font-bold text-white text-2xl tracking-tight">
                      {mainListing.priceLabel}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Top Row */}
          {topRow.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}

          {/* Bottom Row */}
          {bottomRow.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <div className="listing-card group cursor-pointer">
      <Link href={`/properties/${listing.id}`}>
        <div className="relative overflow-hidden rounded-2xl bg-neutral-100 h-full">
          <div className="relative aspect-[4/3]">
            <Image
              src={listing.image}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            </div>

            <div className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-neutral-900">
              {listing.type}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-1.5 text-white/70 text-xs mb-1">
                <MapPin className="h-3 w-3" />
                {listing.location}
              </div>
              <h3 className="font-semibold text-white text-base mb-2 line-clamp-1 tracking-tight">
                {listing.title}
              </h3>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white/70 text-xs">
                  <span>{listing.bedrooms} Beds</span>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span>{listing.bathrooms} Baths</span>
                </div>
                <p className="font-bold text-white text-lg tracking-tight">
                  {listing.priceLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
