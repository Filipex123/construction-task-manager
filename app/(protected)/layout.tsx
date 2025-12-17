// app/(protected)/layout.tsx
'use client';

import { ObrasProvider } from '../context/Obras.context';
import { PageTitleProvider } from '../context/PageTitle.context';
import { SidebarProvider } from '../context/Sidebar.context';
import { TaskOptionsProvider } from '../context/TaskOptions.context';
import { PageTemplate } from './components/PageTemplate';
import ProtectedLayout from './ProtectedLayout/ProtectedLayout';

export default function ProtectedSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ObrasProvider>
        <TaskOptionsProvider>
          <ProtectedLayout>
            <PageTitleProvider>
              <PageTemplate>{children}</PageTemplate>
            </PageTitleProvider>
          </ProtectedLayout>
        </TaskOptionsProvider>
      </ObrasProvider>
    </SidebarProvider>
  );
}
