// app/(protected)/layout.tsx
'use client';

import { PageTitleProvider } from '../context/PageTitle.context';
import { SidebarProvider } from '../context/Sidebar.context';
import { PageTemplate } from './components/PageTemplate';
import ProtectedLayout from './ProtectedLayout/ProtectedLayout';

export default function ProtectedSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout>
      <SidebarProvider>
        <PageTitleProvider>
          <PageTemplate>{children}</PageTemplate>
        </PageTitleProvider>
      </SidebarProvider>
    </ProtectedLayout>
  );
}
