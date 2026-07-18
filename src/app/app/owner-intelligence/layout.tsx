import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Owner Intelligence · Zaylo",
}

export default function OwnerIntelligenceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
