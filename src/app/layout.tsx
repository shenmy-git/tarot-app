import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '神秘解读',
  description: '6 种神秘解读，发现你内心的答案',
};

export const viewport: Viewport = {
  themeColor: '#6b21a8',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // 注意：html/ lang 由 [locale]/layout.tsx 通过 NextIntlClientProvider 设置
  return children as React.ReactElement;
}