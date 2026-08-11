import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';

import type { TowerState } from '@/@types/workspace.types';
import { Workspace } from '@/components/Workspace/Workspace';
import { mockPaletteConfig } from '@/mocks/palette';
import { createMockTowerRoot } from '@/mocks/workspaceTower';
import { useWorkspaceStore } from '@/stores/workspace';
import { discardTower } from '@/utils/towerDiscard';

// A harness for driving import/export by hand, ahead of any file-system wiring: the textarea
// stands in for the file, so the JSON can be read after an export and pasted back for an import.
const ImportExportHarness = () => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Two towers, so an export has to keep their nodes and placements apart.
    const towers: TowerState[] = [
      { id: 'harness-tower-1', position: { x: 100, y: 100 }, root: createMockTowerRoot() },
      { id: 'harness-tower-2', position: { x: 500, y: 100 }, root: createMockTowerRoot() },
    ];
    towers.forEach(useWorkspaceStore.getState().createTower);

    // The workspace store is global, so without this the harness towers would follow the reader
    // into every other Workspace story. Whatever is on the canvas goes, since an import will have
    // replaced the towers seeded above with ones under freshly minted ids.
    return () => {
      for (const id of Object.keys(useWorkspaceStore.getState().towers)) discardTower(id);
    };
  }, []);

  const handleExport = () => {
    setJsonText(JSON.stringify(useWorkspaceStore.getState().exportWorkspace(), null, 2));
    setError(null);
  };

  const handleImport = () => {
    try {
      // Both the parse and the import can reject the text; neither leaves the workspace half-built.
      useWorkspaceStore.getState().importWorkspace(JSON.parse(jsonText));
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col gap-2 bg-indigo-100 p-2">
      <div className="flex flex-col gap-2 rounded-lg bg-white p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
          >
            Export Workspace
          </button>
          <button
            onClick={handleImport}
            className="rounded bg-green-500 px-4 py-2 font-semibold text-white hover:bg-green-600"
          >
            Import Workspace
          </button>
          <textarea
            className="h-12 flex-1 resize-y rounded border border-gray-300 p-1 font-mono text-xs"
            placeholder="JSON appears here on export. Paste a project here to import it."
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />
        </div>
        {error !== null && (
          <p className="rounded bg-red-50 px-2 py-1 font-mono text-xs text-red-700">{error}</p>
        )}
      </div>
      <div className="relative h-full w-full overflow-hidden rounded-lg bg-white">
        <Workspace config={{ palette: mockPaletteConfig }} />
      </div>
    </div>
  );
};

const meta: Meta<typeof ImportExportHarness> = {
  title: 'Workspace/ImportExport',
  component: ImportExportHarness,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ImportExportHarness>;

export const Default: Story = {};
