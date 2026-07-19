import type { Metadata } from "next";
import "./globals.css";

import { ClerkProviderWrapper } from "@/components/clerk-provider-wrapper";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import { Toaster } from "@/components/ui/sonner";
import { BRAND_DESCRIPTION, BRAND_NAME, BRAND_TAGLINE, BRAND_TITLE } from "@/lib/brand";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: BRAND_TITLE,
    template: `%s · ${BRAND_NAME}`,
  },
  description: BRAND_DESCRIPTION,
  applicationName: BRAND_NAME,
  authors: [{ name: "Hampus" }],
  creator: "Hampus",
  openGraph: {
    type: "website",
    locale: "en_AE",
    siteName: BRAND_NAME,
    title: BRAND_TITLE,
    description: BRAND_TAGLINE,
  },
  twitter: {
    card: "summary",
    title: BRAND_TITLE,
    description: BRAND_TAGLINE,
  },
  appleWebApp: {
    title: BRAND_NAME,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-work-sans">
        <ClerkProviderWrapper>
          <ThemeProvider defaultTheme="system" storageKey="nextjs-ui-theme">
            <SidebarConfigProvider>
              {children}
              <Toaster position="bottom-right" richColors closeButton />
            </SidebarConfigProvider>
          </ThemeProvider>
        </ClerkProviderWrapper>
      </body>
    </html>
  );
}
