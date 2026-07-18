import { useEffect, useRef } from 'react';

import { Workspace } from '@/components/Workspace/Workspace';
import { mockPaletteConfig } from '@/mocks/palette';
import { createMockTowerRoot } from '@/mocks/workspaceTower';
import { useWorkspaceStore } from '@/stores/workspace';

export default function WorkspaceDemo() {
  const initialized = useRef(false);

  useEffect(() => {
    // Initialize the workspace with a pre-configured mock tower containing nested bricks for testing
    if (!initialized.current) {
      initialized.current = true;
      const root = createMockTowerRoot();
      useWorkspaceStore.getState().createTower({
        id: 'mock-tower-1',
        position: { x: 400, y: 100 },
        root,
      });
    }
  }, []);

  return (
    <div className="h-full w-full bg-indigo-100 p-2">
      <div className="h-full w-full rounded-lg bg-white">
        <Workspace config={{ palette: mockPaletteConfig }} />
      </div>
    </div>
  );
}
