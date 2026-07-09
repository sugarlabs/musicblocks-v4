import type { WorkspaceViewProps } from '@/@types/workspace.types';

import { Palette } from '@/components/Palette/Palette';

export function Workspace({ config }: WorkspaceViewProps) {
  const { palette } = config;

  return (
    <div className="flex h-full w-full">
      <div className="h-full max-w-80">
        <Palette config={palette} />
      </div>

      <div className="h-full w-full shrink"></div>
    </div>
  );
}
