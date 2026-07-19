"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import { SpaceBackground } from "@/components/landing/space-background"

export default function LandingPage() {
  return (
    <main className="fixed inset-0 h-[100dvh] w-screen overflow-hidden overscroll-none bg-neutral-950 text-white touch-none">
      <SpaceBackground intense />
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6">
        <div className="flex max-w-lg flex-col items-center text-center">
          <Logo size={48} tone="hero" className="mb-6" />
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-neutral-400">
            Dubai brokerage OS
          </p>
          <h1 className="bg-gradient-to-b from-white via-neutral-100 to-neutral-500 bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-6xl">
            Zaylo
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-400">
            Team CRM, active listings, and daily broker ops — sign in to continue.
          </p>

          <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
            <Link
              href="/sign-in"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
            >
              Log in
            </Link>
            <Link
              href="/sign-in?next=/app/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10"
            >
              Agent portal
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
