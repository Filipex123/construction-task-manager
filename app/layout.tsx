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
  title: 'Vital Gestão - Medição',
  applicationName: 'Vital App - Medição',
  description: 'App para controle de medição das atividades das obras de construção civil',
  icons: {
    icon: '/favicon.ico',
    shortcut: '../logo_construtora-vital.png',
    apple: '../logo_construtora-vital.png',
  },
  // themeColor: '#1E40AF',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
