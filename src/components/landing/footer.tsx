"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Instagram, Linkedin, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react"

const footerLinks = {
  properties: [
    { label: "Villas", href: "/inventory?type=villa" },
    { label: "Apartments", href: "/inventory?type=apartment" },
    { label: "Penthouses", href: "/inventory?type=penthouse" },
    { label: "Townhouses", href: "/inventory?type=townhouse" },
    { label: "Off-Plan", href: "/inventory?status=off-plan" },
  ],
  areas: [
    { label: "Palm Jumeirah", href: "/areas/palm-jumeirah" },
    { label: "Dubai Marina", href: "/areas/dubai-marina" },
    { label: "Downtown Dubai", href: "/areas/downtown-dubai" },
    { label: "Emirates Hills", href: "/areas/emirates-hills" },
    { label: "Arabian Ranches", href: "/areas/arabian-ranches" },
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
  { icon: Instagram, href: "https://instagram.com/elysian", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com/company/elysian", label: "LinkedIn" },
  { icon: Facebook, href: "https://facebook.com/elysian", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com/elysian", label: "Twitter" },
]

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      {/* CTA Section */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Ready to find your dream home?
              </h2>
              <p className="text-white/60">
                Let our experts guide you to the perfect property in Dubai.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-amber-500 px-8 py-4 text-neutral-900 font-semibold hover:bg-amber-400 transition-colors whitespace-nowrap"
            >
              Get in Touch
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 font-bold text-xl text-neutral-900">
                E
              </div>
              <span className="text-2xl font-bold">ELYSIAN</span>
            </Link>
            <p className="text-white/60 mb-6 max-w-sm leading-relaxed">
              Dubai&apos;s premier luxury real estate agency, specializing in exceptional properties across the city&apos;s most prestigious addresses.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="tel:+971501234567"
                className="flex items-center gap-3 text-white/80 hover:text-amber-400 transition-colors"
              >
                <Phone className="h-5 w-5" />
                +971 50 123 4567
              </a>
              <a
                href="mailto:hello@elysian.ae"
                className="flex items-center gap-3 text-white/80 hover:text-amber-400 transition-colors"
              >
                <Mail className="h-5 w-5" />
                hello@elysian.ae
              </a>
              <div className="flex items-start gap-3 text-white/60">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>
                  Level 23, Boulevard Plaza Tower 1<br />
                  Downtown Dubai, UAE
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-amber-500 hover:text-neutral-900 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Properties</h3>
            <ul className="space-y-3">
              {footerLinks.properties.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Areas</h3>
            <ul className="space-y-3">
              {footerLinks.areas.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-amber-400 transition-colors"
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
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} Elysian Real Estate. All rights reserved.
            </p>
            <div className="flex gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white/40 text-sm hover:text-white/80 transition-colors"
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
