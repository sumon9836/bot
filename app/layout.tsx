import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './fonts.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '𝐊ąìʂҽղ-𝐌𝐃 | Bot Dashboard',
  description: 'Modern WhatsApp Bot Management Dashboard',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🤖</text></svg>",
  },
  other: {
    'preconnect': ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 5.0,
  userScalable: true,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}