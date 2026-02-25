import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/portal/context/AuthContext';

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const { profile, role } = useAuth();

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border/50 bg-background px-4 lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-6" />

      {title && (
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      )}

      <div className="ml-auto flex items-center gap-3">
        <Badge variant="outline" className="capitalize">
          {role}
        </Badge>
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {profile?.full_name}
        </span>
      </div>
    </header>
  );
}
