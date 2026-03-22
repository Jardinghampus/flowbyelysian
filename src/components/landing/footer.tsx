"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Instagram, Linkedin, Facebook, Twitter, Mail, Phone, MapPin, ArrowRight } from "lucide-react"

const footerLinks = {
  properties: [
    { label: "Villas", href: "/user/marketplace?type=villa" },
    { label: "Apartments", href: "/user/marketplace?type=apartment" },
    { label: "Penthouses", href: "/user/marketplace?type=penthouse" },
    { label: "Townhouses", href: "/user/marketplace?type=townhouse" },
    { label: "Off-Plan Projects", href: "/off-plan" },
    { label: "Submit Opportunity", href: "/opportunity" },
  ],
  areas: [
    { label: "DAMAC Hills", href: "/communities/damac-hills" },
    { label: "Tilal Al Ghaf", href: "/communities/tilal-al-ghaf" },
    { label: "Al Furjan", href: "/communities/al-furjan" },
    { label: "Jumeirah Golf Estates", href: "/communities/jumeirah-golf-estates" },
    { label: "Palm Jumeirah", href: "/communities/palm-jumeirah" },
    { label: "Other Communities", href: "/communities/other-villa-communities" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Our Team", href: "/team" },
    { label: "Careers", href: "/careers" },
    { label: "News & Insights", href: "/news" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
}

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/zaylo", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com/company/zaylo", label: "LinkedIn" },
  { icon: Facebook, href: "https://facebook.com/zaylo", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com/zaylo", label: "Twitter" },
]

export function Footer() {
  return (
    <footer className="bg-neutral-950 text-white">
      {/* CTA Section */}
      <div className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
                Ready to find your dream home?
              </h2>
              <p className="text-white/40">
                Let our experts guide you to the perfect property in Dubai.
              </p>
            </div>
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-neutral-900 font-semibold hover:bg-neutral-100 transition-all duration-200 whitespace-nowrap hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              Get in Touch
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="group flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white font-bold text-xl text-neutral-900 transition-transform duration-200 group-hover:scale-105">
                Z
              </div>
              <span className="text-2xl font-bold tracking-tight">ZAYLO</span>
            </Link>
            <p className="text-white/35 mb-6 max-w-sm leading-relaxed">
              Dubai&apos;s premier luxury real estate agency, specializing in exceptional properties across the city&apos;s most prestigious addresses.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="tel:+971501234567"
                className="flex items-center gap-3 text-white/50 hover:text-white transition-colors duration-200"
              >
                <Phone className="h-4 w-4" />
                +971 50 123 4567
              </a>
              <a
                href="mailto:hello@zaylo.ae"
                className="flex items-center gap-3 text-white/50 hover:text-white transition-colors duration-200"
              >
                <Mail className="h-4 w-4" />
                hello@zaylo.ae
              </a>
              <div className="flex items-start gap-3 text-white/35">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  Level 23, Boulevard Plaza Tower 1<br />
                  Downtown Dubai, UAE
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-2 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-white/50 hover:bg-white/[0.12] hover:text-white transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/60 mb-5">Properties</h3>
            <ul className="space-y-3">
              {footerLinks.properties.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/35 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/60 mb-5">Areas</h3>
            <ul className="space-y-3">
              {footerLinks.areas.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/35 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/60 mb-5">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/35 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/25 text-sm">
              &copy; {new Date().getFullYear()} Zaylo Marketplace. All rights reserved.
            </p>
            <div className="flex gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white/25 text-sm hover:text-white/50 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
