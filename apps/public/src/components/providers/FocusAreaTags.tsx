import { Badge } from '@hci/shared/ui/badge';

interface FocusAreaTagsProps {
  areas: string[];
}

export function FocusAreaTags({ areas }: FocusAreaTagsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {areas.map((area) => (
        <Badge key={area} variant="secondary" className="text-sm px-3 py-1">
          {area}
        </Badge>
      ))}
    </div>
  );
}
