import { Link } from "react-router-dom";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  className?: string;
}

export function ServiceCard({ title, description, icon: Icon, href, className }: ServiceCardProps) {
  return (
    <Link to={href}>
      <Card className={cn(
        "group h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50",
        className
      )}>
        <CardContent className="p-6 flex flex-col h-full">
          <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-4 group-hover:bg-secondary/30 transition-colors">
            <Icon className="h-6 w-6 text-secondary" />
          </div>
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground flex-1">{description}</p>
          <div className="flex items-center gap-1 mt-4 text-secondary font-medium group-hover:gap-2 transition-all">
            Learn more <ArrowRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}