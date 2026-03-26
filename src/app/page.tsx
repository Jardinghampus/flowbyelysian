"use client"

import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturedListings } from "@/components/landing/featured-listings"
import { TextParallaxContent, ContentBlock } from "@/components/landing/text-parallax"
import { AreasSection, AreaGallery } from "@/components/landing/areas-section"
import { TeamSection } from "@/components/landing/team-section"
import { OpportunityCTA } from "@/components/landing/opportunity-cta"
import { OffPlanCTA } from "@/components/landing/off-plan-cta"
import { Footer } from "@/components/landing/footer"
import { ChatPopup } from "@/components/landing/chat-popup"
import { MobileMenuProvider } from "@/contexts/mobile-menu-context"

export default function LandingPage() {
  return (
    <MobileMenuProvider>
    <main className="bg-white">
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Opportunity AIDA CTA */}
      <OpportunityCTA />

      {/* Off-Plan AIDA CTA */}
      <OffPlanCTA />

      {/* Featured Listings */}
      <section id="properties">
        <FeaturedListings />
      </section>

      {/* Parallax Sections — Focus Communities */}
      <div className="bg-white">
        {/* 1. Tilal Al Ghaf */}
        <TextParallaxContent
          imgUrl="https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2670&auto=format&fit=crop"
          subheading="Tilal Al Ghaf"
          heading="Lagoon Living Perfected"
        >
          <ContentBlock
            title="Crystal lagoons and sustainable luxury"
            description="Tilal Al Ghaf by Majid Al Futtaim is Dubai's most anticipated master-planned community. Centered around a pristine lagoon with white sand beaches, it offers luxury villas with world-class amenities and sustainable design."
            secondaryText="From Harmony villas to the ultra-exclusive Serenity mansions, discover lagoon-front living at its finest."
            ctaText="Discover Tilal Al Ghaf"
            ctaLink="/communities/tilal-al-ghaf"
          />
        </TextParallaxContent>

        {/* 2. Mudon */}
        <TextParallaxContent
          imgUrl="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop"
          subheading="Mudon"
          heading="Family Living at Its Finest"
        >
          <ContentBlock
            title="A thriving family-first community"
            description="Mudon by Dubai Properties is a vibrant, self-contained community offering spacious townhouses and villas surrounded by lush parks, pools, and cycling trails. Designed for families who value space, community, and tranquillity."
            secondaryText="With Mudon Views, Al Naseem, and Arabella townhouses, there's something for every family at every stage."
            ctaText="Explore Mudon"
            ctaLink="/communities/mudon"
          />
        </TextParallaxContent>

        {/* 3. Arabian Ranches I / II / III */}
        <TextParallaxContent
          imgUrl="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop"
          subheading="Arabian Ranches I · II · III"
          heading="The Gold Standard of Villa Living"
        >
          <ContentBlock
            title="Dubai's most established villa community"
            description="Arabian Ranches by Emaar set the benchmark for family living in Dubai. From the original Spanish-inspired Alvorada to the contemporary designs of Arabian Ranches III, the community offers golf courses, equestrian centres, and top-rated schools."
            secondaryText="Choose from Ranches I classics like Saheel and Palmera, or the modern Sun and Caya clusters of Ranches III."
            ctaText="Discover Arabian Ranches"
            ctaLink="/communities/arabian-ranches"
          />
        </TextParallaxContent>

        {/* 4. Town Square */}
        <TextParallaxContent
          imgUrl="https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2596&auto=format&fit=crop"
          subheading="Town Square"
          heading="Urban Community, Suburban Soul"
        >
          <ContentBlock
            title="Affordable luxury in a vibrant neighbourhood"
            description="Town Square by Nshama is one of Dubai's best-value master-planned communities. With over 600,000 sqft of retail, a cinema, Vida hotel, and sprawling central park, it blends city convenience with neighbourhood charm."
            secondaryText="Ideal for first-time buyers and young families looking for modern apartments and townhouses with excellent ROI."
            ctaText="Explore Town Square"
            ctaLink="/communities/town-square"
          />
        </TextParallaxContent>

        {/* 5. DAMAC Hills */}
        <TextParallaxContent
          imgUrl="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2675&auto=format&fit=crop"
          subheading="DAMAC Hills"
          heading="Golf Course Living Elevated"
        >
          <ContentBlock
            title="World-class golf and luxury villas"
            description="DAMAC Hills is home to the Trump International Golf Club Dubai and offers an exclusive collection of villas, townhouses, and apartments. With a full-service community of restaurants, sports facilities, and wellness centres, it's the complete lifestyle."
            secondaryText="From contemporary Akoya villas to the Pelham and Carson clusters, every home overlooks the championship fairways."
            ctaText="Explore DAMAC Hills"
            ctaLink="/communities/damac-hills"
          />
        </TextParallaxContent>

        {/* 6. Dubai Hills Estate */}
        <TextParallaxContent
          imgUrl="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2670&auto=format&fit=crop"
          subheading="Dubai Hills Estate"
          heading="The Heart of New Dubai"
        >
          <ContentBlock
            title="An 18-hole championship lifestyle"
            description="Dubai Hills Estate by Emaar and Meraas is a premium mixed-use community with an 18-hole golf course, Dubai Hills Mall, and panoramic skyline views. From luxury villas on the fairway to contemporary apartments, it sets the standard for modern Dubai living."
            secondaryText="Sidra, Maple, Golf Place, and Park Heights — every sub-community offers a distinct lifestyle within one world-class masterplan."
            ctaText="Explore Dubai Hills"
            ctaLink="/communities/dubai-hills"
          />
        </TextParallaxContent>

        {/* 7. Palm Jumeirah (further down) */}
        <TextParallaxContent
          imgUrl="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2670&auto=format&fit=crop"
          subheading="Palm Jumeirah"
          heading="Beachfront Living Redefined"
        >
          <ContentBlock
            title="Experience the pinnacle of waterfront luxury"
            description="Palm Jumeirah represents the ultimate in Dubai living. Our exclusive portfolio includes signature villas with private beaches, panoramic penthouses, and world-class amenities that define luxury waterfront living."
            secondaryText="From sunrise over the Arabian Gulf to sunset views of the Dubai skyline, every moment on the Palm is extraordinary."
            ctaText="Explore Palm Properties"
            ctaLink="/communities/palm-jumeirah"
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
      <section id="contact" className="relative py-28 bg-white overflow-hidden">
        {/* Subtle background accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-50 to-violet-50 rounded-full blur-3xl opacity-60" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Start Your Journey
          </p>
          <h2 className="text-4xl font-bold text-neutral-900 md:text-5xl mb-6 tracking-tight">
            Let&apos;s Find Your Perfect Home
          </h2>
          <p className="text-lg text-neutral-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Whether you&apos;re looking to buy, sell, or rent, our team of experts is ready to guide you through every step of your real estate journey in Dubai.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+971501234567"
              className="group inline-flex items-center justify-center rounded-full bg-neutral-900 px-8 py-4 text-white font-semibold hover:bg-neutral-800 transition-all duration-200 hover:shadow-xl hover:shadow-neutral-900/20"
            >
              Call Us Now
            </a>
            <a
              href="mailto:hello@zaylo.ae"
              className="inline-flex items-center justify-center rounded-full border border-neutral-200 px-8 py-4 text-neutral-900 font-semibold hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200"
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
    </MobileMenuProvider>
  )
}
