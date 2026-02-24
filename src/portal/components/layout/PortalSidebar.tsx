import { useLocation, Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  ClipboardList,
  Briefcase,
  MessageSquare,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/portal/context/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const adminNav: NavItem[] = [
  { title: 'Dashboard', href: '/portal/admin', icon: LayoutDashboard },
  { title: 'Projects', href: '/portal/admin/projects', icon: FolderKanban },
  { title: 'Users', href: '/portal/admin/users', icon: Users },
  { title: 'Audit Log', href: '/portal/admin/audit-log', icon: ShieldCheck },
];

const staffNav: NavItem[] = [
  { title: 'Patient Queue', href: '/portal/staff', icon: ClipboardList },
];

const brokerNav: NavItem[] = [
  { title: 'Forwarded Patients', href: '/portal/broker', icon: Briefcase },
];

export function PortalSidebar() {
  const { role, profile, signOut } = useAuth();
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href;

  const renderNavGroup = (label: string, items: NavItem[]) => (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
              >
                <Link to={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
            HCI
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">HCI Portal</span>
            <span className="text-xs text-muted-foreground capitalize">{role} Access</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Admin navigation */}
        {role === 'admin' && renderNavGroup('Administration', adminNav)}

        {/* Staff navigation — visible to admin and staff */}
        {(role === 'admin' || role === 'staff') && renderNavGroup(
          role === 'admin' ? 'Staff View' : 'Outreach',
          staffNav
        )}

        {/* Broker navigation */}
        {role === 'broker' && renderNavGroup('Broker Portal', brokerNav)}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
            {profile?.full_name?.charAt(0) ?? '?'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">{profile?.full_name}</span>
            <span className="text-xs text-muted-foreground truncate">{profile?.email}</span>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut}>
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
