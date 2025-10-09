import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { PageTemplate } from './(protected)/components/PageTemplate';
import { PageTitleProvider } from './context/PageTitle.context';
import { SidebarProvider } from './context/Sidebar.context';
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
  // themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased  bg-gray-100`}>
        <SidebarProvider>
          <PageTitleProvider>
            <PageTemplate children={children} />
          </PageTitleProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}
