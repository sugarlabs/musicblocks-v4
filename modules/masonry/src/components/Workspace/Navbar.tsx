import { Undo2, Redo2 } from 'lucide-react';

import { useWorkspaceHistoryStore } from '@/stores/history';

/**
 * Top Navigation Bar for the Workspace.
 * Contains global workspace tools like Undo and Redo.
 */
export function Navbar() {
  return (
    <div className="border-border bg-background flex h-12 shrink-0 items-center gap-2 border-b px-4">
      <button
        className="hover:bg-muted text-foreground flex cursor-pointer items-center justify-center rounded-md p-2 transition-colors"
        onClick={() => useWorkspaceHistoryStore.getState().undo()}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={20} />
      </button>
      <button
        className="hover:bg-muted text-foreground flex cursor-pointer items-center justify-center rounded-md p-2 transition-colors"
        onClick={() => useWorkspaceHistoryStore.getState().redo()}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 size={20} />
      </button>
    </div>
  );
}
