import { useEffect } from 'react';

import { Workspace } from '@/components/Workspace/Workspace';
import { mockPaletteConfig } from '@/mocks/palette';
import { createMockTowerRoot } from '@/mocks/workspaceTower';
import { useWorkspaceStore } from '@/stores/workspace';

let isMockWorkspaceInitialized = false;

export default function WorkspaceDemo() {
  useEffect(() => {
    // Initialize the workspace once per session with a pre-configured mock tower containing nested bricks for testing
    if (!isMockWorkspaceInitialized) {
      isMockWorkspaceInitialized = true;
      const root = createMockTowerRoot();
      useWorkspaceStore.getState().createTower({
        id: 'mock-tower-1',
        position: { x: 400, y: 100 },
        root,
      });
    }
  }, []);

  return (
    <div className="h-full w-full bg-slate-100 p-2 transition-colors duration-200 dark:bg-slate-950">
      <div className="bg-background border-border h-full w-full overflow-hidden rounded-lg border shadow-xs">
        <Workspace config={{ palette: mockPaletteConfig }} />
      </div>
    </div>
  );
}
