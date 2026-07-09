import type { WorkspaceViewProps } from '@/@types/workspace.types';

import { Palette } from '@/components/Palette/Palette';
import { TowerView } from '@/components/Tower/Tower';
import { useWorkspaceStore } from '@/stores';

export function Workspace({ config }: WorkspaceViewProps) {
  const { palette } = config;
  const towersRecord = useWorkspaceStore((state) => state.towers);
  const towers = Object.values(towersRecord);

  return (
    <div className="flex h-full w-full">
      <div className="h-full max-w-80">
        <Palette config={palette} />
      </div>

      <div className="bg-background relative h-full w-full shrink overflow-hidden">
        {towers.map((tower) => (
          <TowerView key={tower.id} root={tower.root} coords={tower.position} asChild />
        ))}
      </div>
    </div>
  );
}
