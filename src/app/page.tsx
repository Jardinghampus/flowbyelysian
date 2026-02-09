"use client"

import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturedListings } from "@/components/landing/featured-listings"
import { TextParallaxContent, ContentBlock } from "@/components/landing/text-parallax"
import { AreasSection, AreaGallery } from "@/components/landing/areas-section"
import { TeamSection } from "@/components/landing/team-section"
import { Footer } from "@/components/landing/footer"
import { ChatPopup } from "@/components/landing/chat-popup"

export default function LandingPage() {
  return (
    <main className="bg-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Featured Listings */}
      <section id="properties">
        <FeaturedListings />
      </section>

      {/* Parallax Sections */}
      <div className="bg-white">
        <TextParallaxContent
          imgUrl="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2675&auto=format&fit=crop"
          subheading="Palm Jumeirah"
          heading="Beachfront Living Redefined"
        >
          <ContentBlock
            title="Experience the pinnacle of waterfront luxury"
            description="Palm Jumeirah represents the ultimate in Dubai living. Our exclusive portfolio includes signature villas with private beaches, panoramic penthouses, and world-class amenities that define luxury waterfront living."
            secondaryText="From sunrise over the Arabian Gulf to sunset views of the Dubai skyline, every moment on the Palm is extraordinary."
            ctaText="Explore Palm Properties"
            ctaLink="/areas/palm-jumeirah"
          />
        </TextParallaxContent>

        <TextParallaxContent
          imgUrl="https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=2574&auto=format&fit=crop"
          subheading="Dubai Marina"
          heading="Urban Sophistication"
        >
          <ContentBlock
            title="Where city life meets waterfront elegance"
            description="Dubai Marina offers a vibrant lifestyle with stunning high-rise residences overlooking the marina and Arabian Gulf. World-class dining, entertainment, and the famous Marina Walk are at your doorstep."
            secondaryText="Whether you seek a sleek apartment or a spacious penthouse, Marina living offers the perfect blend of convenience and luxury."
            ctaText="Discover Marina Living"
            ctaLink="/areas/dubai-marina"
          />
        </TextParallaxContent>

        <TextParallaxContent
          imgUrl="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop"
          subheading="Villa Communities"
          heading="Family Estates & Gardens"
        >
          <ContentBlock
            title="Spacious living in Dubai's finest communities"
            description="From the championship golf courses of Emirates Hills to the lagoon lifestyle of Tilal Al Ghaf, Dubai's premium villa communities offer families the space, privacy, and amenities they deserve."
            secondaryText="Discover gated communities with world-class schools, parks, and recreational facilities that make Dubai the perfect place to call home."
            ctaText="Browse Villa Communities"
            ctaLink="/areas/villa-communities"
          />
        </TextParallaxContent>
      </div>

      {/* Areas Section */}
      <section id="areas">
        <AreasSection />
        <AreaGallery />
      </section>

      {/* Team Section */}
      <section id="team">
        <TeamSection />
      </section>

      {/* Contact CTA Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-amber-600">
            Start Your Journey
          </p>
          <h2 className="text-4xl font-bold text-neutral-900 md:text-5xl mb-6">
            Let&apos;s Find Your Perfect Home
          </h2>
          <p className="text-lg text-neutral-600 mb-10 max-w-2xl mx-auto">
            Whether you&apos;re looking to buy, sell, or rent, our team of experts is ready to guide you through every step of your real estate journey in Dubai.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+971501234567"
              className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-8 py-4 text-white font-semibold hover:bg-neutral-800 transition-colors"
            >
              Call Us Now
            </a>
            <a
              href="mailto:hello@elysian.ae"
              className="inline-flex items-center justify-center rounded-full border-2 border-neutral-900 px-8 py-4 text-neutral-900 font-semibold hover:bg-neutral-900 hover:text-white transition-colors"
            >
              Send an Email
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Chat Popup */}
      <ChatPopup />
    </main>
  )
}
