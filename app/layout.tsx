import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
import CoachRickChat from '@/components/coach-rick-chat';
import { MainLayout } from '@/components/layout/MainLayout';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'CatchBarrels - Momentum Transfer System',
  description: 'AI-Powered Baseball Swing Analysis & Momentum Transfer Training',
  manifest: '/manifest.json',
  metadataBase: new URL(process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://catchbarrels.app'),
  icons: {
    icon: '/branding/favicon.ico',
    shortcut: '/branding/favicon.ico',
    apple: '/branding/logo-mark-icon.png',
  },
  openGraph: {
    title: 'CatchBarrels - Momentum Transfer System',
    description: 'AI-Powered Baseball Swing Analysis & Momentum Transfer Training',
    url: 'https://catchbarrels.app',
    siteName: 'CatchBarrels',
    images: [{
      url: '/branding/social-card-default.png',
      width: 1200,
      height: 630,
      alt: 'CatchBarrels - Track your momentum, not just your stats.',
    }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CatchBarrels - Momentum Transfer System',
    description: 'AI-Powered Baseball Swing Analysis & Momentum Transfer Training',
    images: ['/branding/social-card-default.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CatchBarrels',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    // Add verification tokens when available
    // google: 'your-google-verification-token',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BARRELS" />
      </head>
      <body className={inter.className}>
        <Providers>
          <MainLayout>
            {children}
          </MainLayout>
          <CoachRickChat />
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
