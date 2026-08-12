import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';

import { Workspace } from '@/components/Workspace/Workspace';
import { mockPaletteConfig } from '@/mocks/palette';
import { createMockTowerRoot } from '@/mocks/workspaceTower';
import { useWorkspaceStore } from '@/stores/workspace';

// A wrapper component that provides the UI buttons and a textarea for testing Import/Export
const ImportExportWrapper = () => {
  const initialized = useRef(false);
  const [jsonText, setJsonText] = useState('');

  useEffect(() => {
    // Initialize the workspace with two pre-configured mock towers for testing
    if (!initialized.current) {
      initialized.current = true;
      const root1 = createMockTowerRoot();
      useWorkspaceStore.getState().createTower({
        id: 'test-tower-1',
        position: { x: 100, y: 100 },
        root: root1,
      });

      const root2 = createMockTowerRoot();
      // The two towers will be identical, which is fine for testing.
      useWorkspaceStore.getState().createTower({
        id: 'test-tower-2',
        position: { x: 500, y: 100 },
        root: root2,
      });
    }
  }, []);

  const handleExport = () => {
    const exported = useWorkspaceStore.getState().exportWorkspace();
    setJsonText(JSON.stringify(exported, null, 2));
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      // useWorkspaceStore.getState().importWorkspace(parsed);
      console.log('Import triggered (Not yet implemented)', parsed);
    } catch (e) {
      console.error('Invalid JSON', e);
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col gap-2 bg-indigo-100 p-2">
      <div className="flex items-center gap-2 rounded-lg bg-white p-2">
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
          placeholder="JSON will appear here on export. Paste JSON here to import."
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
        />
      </div>
      <div className="relative h-full w-full overflow-hidden rounded-lg bg-white">
        <Workspace config={{ palette: mockPaletteConfig }} />
      </div>
    </div>
  );
};

const meta: Meta<typeof ImportExportWrapper> = {
  title: 'Workspace/ImportExport',
  component: ImportExportWrapper,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ImportExportWrapper>;

export const Default: Story = {};
