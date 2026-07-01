import { Search } from 'lucide-react';

import { Input } from '@/ui/input';

interface PaletteSearchProps {
  /** Current search query. */
  value: string;
  /** Called with the next query whenever the input changes. */
  onChange: (next: string) => void;
}

/**
 * Presentational controlled search input with a leading search icon. Filtering itself lives in the
 * parent `Palette` component; this component only surfaces the query and reports edits.
 */
export function PaletteSearch({ value, onChange }: PaletteSearchProps) {
  return (
    <div className="relative">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search bricks"
        className="pl-8"
      />
    </div>
  );
}
