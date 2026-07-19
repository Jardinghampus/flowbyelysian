import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
  turbopack: {},

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui.shadcn.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'workers.paper.design',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Headers for better security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Redirects for better SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/app/dashboard',
        permanent: true,
      },
      { source: '/admin', destination: '/app/admin', permanent: false },
      { source: '/ai-assistant', destination: '/app/ai-assistant', permanent: false },
      { source: '/areas', destination: '/app/areas', permanent: false },
      { source: '/areas/:path*', destination: '/app/areas/:path*', permanent: false },
      { source: '/calendar', destination: '/app/calendar', permanent: false },
      { source: '/chat', destination: '/app/dashboard', permanent: false },
      { source: '/dashboard', destination: '/app/dashboard', permanent: false },
      { source: '/dashboard-2', destination: '/app/dashboard', permanent: false },
      { source: '/faqs', destination: '/app/faqs', permanent: false },
      { source: '/inventory', destination: '/app/inventory', permanent: false },
      { source: '/mail', destination: '/app/mail', permanent: false },
      { source: '/market', destination: '/app/market-pulse', permanent: false },
      { source: '/marketplace', destination: '/app/exchange', permanent: false },
      { source: '/performance', destination: '/app/performance', permanent: false },
      { source: '/pricing', destination: '/app/pricing', permanent: false },
      { source: '/seo-generator', destination: '/app/seo-generator', permanent: false },
      { source: '/settings/:path*', destination: '/app/settings/:path*', permanent: false },
      { source: '/smart', destination: '/app/smart', permanent: false },
      { source: '/tasks', destination: '/app/tasks', permanent: false },
      { source: '/training', destination: '/app/training', permanent: false },
      { source: '/users', destination: '/app/users', permanent: false },
      { source: '/sign-in-2', destination: '/sign-in', permanent: false },
      { source: '/sign-in-3', destination: '/sign-in', permanent: false },
      { source: '/sign-up-2', destination: '/sign-up', permanent: false },
      { source: '/sign-up-3', destination: '/sign-up', permanent: false },
      { source: '/forgot-password-2', destination: '/forgot-password', permanent: false },
      { source: '/forgot-password-3', destination: '/forgot-password', permanent: false },
    ];
  },
};

export default nextConfig;
