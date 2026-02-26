import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { PortalSidebar } from './PortalSidebar';
import { TopBar } from './TopBar';

export function AppShell() {
  return (
    <SidebarProvider>
      <PortalSidebar />
      <SidebarInset className="min-w-0">
        <TopBar />
        <main className="flex-1 min-w-0 overflow-hidden p-4 lg:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
