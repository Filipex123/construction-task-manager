// app/layout.tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Build Hub - Medição',
  applicationName: 'Build Hub',
  description: 'App para controle de medição das atividades das obras de construção civil',
  icons: {
    icon: '/favicon.ico',
    apple: [{ url: '/new-construtora-icon.png', sizes: '180x180' }],
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans antialiased bg-gray-100`}>{children}</body>
    </html>
  );
}
