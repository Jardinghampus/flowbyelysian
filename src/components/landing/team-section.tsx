"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Mail, Phone, Linkedin, ChevronLeft, ChevronRight } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import AutoScroll from "embla-carousel-auto-scroll"

interface TeamMember {
  id: string
  name: string
  role: string
  specialization: string
  image: string
  linkedin?: string
  email: string
  phone: string
}

const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Ahmed Al Maktoum",
    role: "Senior Sales Director",
    specialization: "Palm Jumeirah & Emirates Hills",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop",
    email: "ahmed@zaylo.ae",
    phone: "+971 50 123 4567",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    role: "Luxury Property Specialist",
    specialization: "Downtown Dubai & DIFC",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop",
    email: "sarah@zaylo.ae",
    phone: "+971 50 234 5678",
  },
  {
    id: "3",
    name: "Mohammed Rashid",
    role: "Villa Communities Expert",
    specialization: "Arabian Ranches & Tilal Al Ghaf",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2670&auto=format&fit=crop",
    email: "mohammed@zaylo.ae",
    phone: "+971 50 345 6789",
  },
  {
    id: "4",
    name: "Emma Williams",
    role: "Marina & JBR Specialist",
    specialization: "Dubai Marina & JBR",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2670&auto=format&fit=crop",
    email: "emma@zaylo.ae",
    phone: "+971 50 456 7890",
  },
  {
    id: "5",
    name: "Omar Hassan",
    role: "Investment Consultant",
    specialization: "Off-Plan & Investment Properties",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2574&auto=format&fit=crop",
    email: "omar@zaylo.ae",
    phone: "+971 50 567 8901",
  },
  {
    id: "6",
    name: "Fatima Al Zahra",
    role: "Client Relations Manager",
    specialization: "VIP & International Clients",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2561&auto=format&fit=crop",
    email: "fatima@zaylo.ae",
    phone: "+971 50 678 9012",
  },
]

function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="group h-full">
      <div className="relative overflow-hidden rounded-2xl bg-white h-full border border-neutral-100 hover:border-neutral-200 transition-all duration-300 hover:shadow-lg hover:shadow-black/5">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Contact Icons - Show on Hover */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
            <a
              href={`mailto:${member.email}`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-neutral-900 hover:bg-white transition-colors"
            >
              <Mail className="h-4 w-4" />
            </a>
            <a
              href={`tel:${member.phone}`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-neutral-900 hover:bg-white transition-colors"
            >
              <Phone className="h-4 w-4" />
            </a>
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-neutral-900 hover:bg-white transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
            {member.name}
          </h3>
          <p className="text-blue-600 font-medium text-sm mb-1">
            {member.role}
          </p>
          <p className="text-neutral-400 text-sm">
            {member.specialization}
          </p>
        </div>
      </div>
    </div>
  )
}

export function TeamSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      skipSnaps: false,
      dragFree: true,
    },
    [AutoScroll({ speed: 1, stopOnInteraction: false, stopOnMouseEnter: true })]
  )

  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <section className="py-28 bg-neutral-50 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Our Experts
          </p>
          <h2 className="text-4xl font-bold text-neutral-900 md:text-5xl mb-4 tracking-tight">
            Meet the Team
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-neutral-500 leading-relaxed">
            Our dedicated team of real estate professionals brings decades of combined experience in Dubai&apos;s luxury property market.
          </p>
        </motion.div>
      </div>

      {/* Carousel */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative"
      >
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-5 pl-4 md:pl-[calc((100vw-1280px)/2+16px)]">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex-shrink-0 w-[280px] md:w-[300px]"
              >
                <TeamCard member={member} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mx-auto max-w-7xl px-4 mt-10 flex items-center justify-center gap-4">
          <button
            onClick={scrollPrev}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all duration-200"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5 text-neutral-600" />
          </button>

          {/* Dots */}
          <div className="flex gap-1.5">
            {teamMembers.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className="h-1.5 rounded-full bg-neutral-200 transition-colors"
                animate={{
                  width: selectedIndex === index ? 24 : 6,
                  backgroundColor: selectedIndex === index ? "#0a0a0a" : "#e5e5e5",
                }}
                transition={{ duration: 0.3 }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={scrollNext}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all duration-200"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5 text-neutral-600" />
          </button>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-16 text-center px-4"
      >
        <p className="text-neutral-500 mb-6">
          Want to join our team of elite real estate professionals?
        </p>
        <a
          href="mailto:careers@zaylo.ae"
          className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-8 py-4 text-white font-medium hover:bg-neutral-800 transition-all duration-200 hover:shadow-lg"
        >
          View Career Opportunities
        </a>
      </motion.div>
    </section>
  )
}
