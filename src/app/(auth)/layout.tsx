import type { Metadata } from "next";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Sign in · ${BRAND_NAME}`,
  description: `Sign in to ${BRAND_NAME} — ${BRAND_TAGLINE}`,
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
