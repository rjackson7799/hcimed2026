import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  FolderKanban,
  Users,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '@/portal/context/AuthContext';
import { cn } from '@/lib/utils';

interface MobileNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const adminTabs: MobileNavItem[] = [
  { label: 'Dashboard', href: '/portal/admin', icon: LayoutDashboard },
  { label: 'Projects', href: '/portal/admin/projects', icon: FolderKanban },
  { label: 'Staff View', href: '/portal/staff', icon: ClipboardList },
  { label: 'Users', href: '/portal/admin/users', icon: Users },
];

const staffTabs: MobileNavItem[] = [
  { label: 'Patients', href: '/portal/staff', icon: ClipboardList },
];

const brokerTabs: MobileNavItem[] = [
  { label: 'Patients', href: '/portal/broker', icon: Briefcase },
];

export function MobileNav() {
  const { role } = useAuth();
  const location = useLocation();

  const tabs = role === 'admin' ? adminTabs : role === 'staff' ? staffTabs : brokerTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white lg:hidden">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.href;
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2 text-xs touch-target',
                isActive ? 'text-primary font-medium' : 'text-muted-foreground'
              )}
            >
              <tab.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
