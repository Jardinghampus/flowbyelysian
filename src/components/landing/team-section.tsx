"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Linkedin, Mail, Phone } from "lucide-react"

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
    email: "ahmed@elysian.ae",
    phone: "+971 50 123 4567",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    role: "Luxury Property Specialist",
    specialization: "Downtown Dubai & DIFC",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop",
    email: "sarah@elysian.ae",
    phone: "+971 50 234 5678",
  },
  {
    id: "3",
    name: "Mohammed Rashid",
    role: "Villa Communities Expert",
    specialization: "Arabian Ranches & Tilal Al Ghaf",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2670&auto=format&fit=crop",
    email: "mohammed@elysian.ae",
    phone: "+971 50 345 6789",
  },
  {
    id: "4",
    name: "Emma Williams",
    role: "Marina & JBR Specialist",
    specialization: "Dubai Marina & JBR",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2670&auto=format&fit=crop",
    email: "emma@elysian.ae",
    phone: "+971 50 456 7890",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
}

export function TeamSection() {
  return (
    <section className="py-24 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Our Experts
          </p>
          <h2 className="text-4xl font-bold text-neutral-900 md:text-5xl mb-4">
            Meet the Team
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-neutral-600">
            Our dedicated team of real estate professionals brings decades of combined experience in Dubai&apos;s luxury property market.
          </p>
        </motion.div>

        {/* Team Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {teamMembers.map((member) => (
            <motion.div
              key={member.id}
              variants={itemVariants}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-shadow duration-300">
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Contact Icons - Show on Hover */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
                    <a
                      href={`mailto:${member.email}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-900 hover:bg-blue-500 hover:text-white transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                    <a
                      href={`tel:${member.phone}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-900 hover:bg-blue-500 hover:text-white transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-900 hover:bg-blue-500 hover:text-white transition-colors"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-neutral-900">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium text-sm mb-2">
                    {member.role}
                  </p>
                  <p className="text-neutral-500 text-sm">
                    {member.specialization}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-neutral-600 mb-6">
            Want to join our team of elite real estate professionals?
          </p>
          <a
            href="mailto:careers@elysian.ae"
            className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-8 py-4 text-white font-medium hover:bg-neutral-800 transition-colors"
          >
            View Career Opportunities
          </a>
        </motion.div>
      </div>
    </section>
  )
}
