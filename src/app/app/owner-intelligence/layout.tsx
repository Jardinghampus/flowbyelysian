import type { Metadata } from "next"

import { BRAND_NAME } from "@/lib/brand"

export const metadata: Metadata = {
  title: `Owner Intelligence · ${BRAND_NAME}`,
}

export default function OwnerIntelligenceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
