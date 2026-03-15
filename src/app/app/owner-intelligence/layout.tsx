import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Owner Intelligence · ZFlow",
}

export default function OwnerIntelligenceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
