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
} from '@hci/shared/ui/sidebar';
import { Badge } from '@hci/shared/ui/badge';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  ClipboardList,
  Briefcase,
  MessageSquare,
  ShieldCheck,
  Activity,
  MapPin,
  ClipboardCheck,
  HeartPulse,
  CalendarDays,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getDisplayTitle } from '@/utils/formatters';
import { cn } from '@hci/shared/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const adminNav: NavItem[] = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Projects', href: '/admin/projects', icon: FolderKanban },
  { title: 'Users', href: '/admin/users', icon: Users },
  { title: 'Audit Log', href: '/admin/audit-log', icon: ShieldCheck },
  { title: 'Practice Health', href: '/admin/practice-health', icon: Activity },
  { title: 'Mobile Docs', href: '/admin/mobile-docs', icon: MapPin },
  { title: 'AWV Tracker', href: '/admin/awv-tracker', icon: ClipboardCheck },
  { title: 'CCM / RPM', href: '/admin/ccm-rpm', icon: HeartPulse },
];

const staffNav: NavItem[] = [
  { title: 'Patient Queue', href: '/staff', icon: ClipboardList },
  { title: 'Staff Calendar', href: '/admin/calendar', icon: CalendarDays },
];

const brokerNav: NavItem[] = [
  { title: 'Forwarded Patients', href: '/broker', icon: Briefcase },
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
                tooltip={item.title}
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
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="px-3 py-4">
        {role === 'broker' && profile?.logo_url ? (
          <div className="flex items-center gap-2">
            <img
              src={profile.logo_url}
              alt={profile.company_name ?? 'Partner'}
              className="h-8 w-auto max-w-[140px] object-contain group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:max-w-[2rem]"
            />
            <span className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">Broker Access</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
              HCI
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold">HCI Portal</span>
              <span className="text-xs text-muted-foreground">{profile ? getDisplayTitle(profile) : role} Access</span>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Admin navigation */}
        {role === 'admin' && renderNavGroup('Administration', adminNav)}

        {/* Staff navigation — visible to admin, staff, and providers */}
        {(role === 'admin' || role === 'staff' || role === 'provider') && renderNavGroup(
          role === 'admin' ? 'Staff View' : role === 'provider' ? 'Patient Outreach' : 'Outreach',
          staffNav
        )}

        {/* Broker navigation */}
        {role === 'broker' && renderNavGroup('Broker Portal', brokerNav)}
      </SidebarContent>

      <SidebarFooter className="px-3 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
            {profile?.full_name?.charAt(0) ?? '?'}
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-medium truncate">{profile?.full_name}</span>
            <span className="text-xs text-muted-foreground truncate">{profile?.email}</span>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} tooltip="Sign Out">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
