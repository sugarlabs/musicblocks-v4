import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { ExportedProject } from '@/@types/import-export.types';
import { useWorkspaceStore } from '@/stores/workspace';
import { exportWorkspace } from '@/utils/import-export';

export interface WorkspaceHistoryStore {
    /** The stack of workspace snapshots */
    history: ExportedProject[];
    /** The current index in the history stack */
    currentIndex: number;
    /** Maximum number of history states to keep */
    maxHistory: number;

    /** Initializes the history with the current workspace state. Call this once on mount. */
    init: () => void;
    /** Snapshots the current workspace state and pushes it to history. */
    commit: () => void;
    /** Reverts the workspace to the previous state in the history stack. */
    undo: () => void;
    /** Advances the workspace to the next state in the history stack. */
    redo: () => void;
    /** Clears the history completely (useful for resetting/importing a new project). */
    clear: () => void;
}

/**
 * Tracks the history of the workspace for Undo/Redo functionality.
 * Snapshots are taken explicitly by calling `commit()` after meaningful actions.
 */
export const useWorkspaceHistoryStore = create<WorkspaceHistoryStore>()(
    subscribeWithSelector((set, get) => ({
        history: [],
        currentIndex: -1,
        maxHistory: 50,

        init: () => {
            try {
                const towers = useWorkspaceStore.getState().towers;
                const current = exportWorkspace(towers);
                set({ history: [current], currentIndex: 0 });
            } catch (e) {
                console.error('history.init: failed to snapshot workspace', e);
            }
        },

        commit: () => {
            try {
                const towers = useWorkspaceStore.getState().towers;
                const current = exportWorkspace(towers);

                set((state) => {
                    // Drop any future states if we are committing a new action after an undo
                    const history = state.history.slice(0, state.currentIndex + 1);
                    history.push(current);

                    if (history.length > state.maxHistory) {
                        history.shift(); // Remove the oldest state
                    }

                    return { history, currentIndex: history.length - 1 };
                });
            } catch (e) {
                console.error('history.commit: failed to snapshot workspace', e);
            }
        },

        undo: () => {
            const { history, currentIndex } = get();
            if (currentIndex > 0) {
                const nextIndex = currentIndex - 1;
                const prevState = history[nextIndex];
                try {
                    // 'preserve' strategy keeps the same brick IDs so React just updates their properties
                    useWorkspaceStore.getState().importWorkspace(prevState, 'preserve');
                    set({ currentIndex: nextIndex });
                } catch (e) {
                    console.error('history.undo: failed to restore workspace', e);
                }
            }
        },

        redo: () => {
            const { history, currentIndex } = get();
            if (currentIndex < history.length - 1) {
                const nextIndex = currentIndex + 1;
                const nextState = history[nextIndex];
                try {
                    useWorkspaceStore.getState().importWorkspace(nextState, 'preserve');
                    set({ currentIndex: nextIndex });
                } catch (e) {
                    console.error('history.redo: failed to restore workspace', e);
                }
            }
        },

        clear: () => {
            set({ history: [], currentIndex: -1 });
        },
    })),
);
