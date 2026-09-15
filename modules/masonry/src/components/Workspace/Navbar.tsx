import { Undo2, Redo2 } from 'lucide-react';

import { useWorkspaceHistoryStore } from '@/stores/history';

/**
 * Top Navigation Bar for the Workspace.
 * Contains global workspace tools like Undo and Redo.
 */
export function Navbar() {
  // Subscribe to history bounds to determine if buttons should be enabled
  const currentIndex = useWorkspaceHistoryStore((state) => state.currentIndex);
  const historyLength = useWorkspaceHistoryStore((state) => state.history.length);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < historyLength - 1;

  return (
    <div className="border-border bg-background flex h-12 shrink-0 items-center gap-2 border-b px-4">
      <button
        className={`text-foreground flex items-center justify-center rounded-md p-2 transition-colors ${
          canUndo ? 'hover:bg-muted cursor-pointer' : 'opacity-50 cursor-not-allowed'
        }`}
        disabled={!canUndo}
        onClick={() => useWorkspaceHistoryStore.getState().undo()}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={20} />
      </button>
      <button
        className={`text-foreground flex items-center justify-center rounded-md p-2 transition-colors ${
          canRedo ? 'hover:bg-muted cursor-pointer' : 'opacity-50 cursor-not-allowed'
        }`}
        disabled={!canRedo}
        onClick={() => useWorkspaceHistoryStore.getState().redo()}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 size={20} />
      </button>
    </div>
  );
}
