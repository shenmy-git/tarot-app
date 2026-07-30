import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https' as const, hostname: '**.supabase.co' },
      { protocol: 'https' as const, hostname: 'api.dicebear.com' },
    ],
  },
};

export default withNextIntl(nextConfig);