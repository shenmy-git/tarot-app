import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // build 阶段跳过 ESLint（独立 lint 步骤在 typecheck 中跑）
  eslint: {
    ignoreDuringBuilds: true,
  },
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