import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface ActionMenuStore {
    /** The ID of the brick the action menu is open on, or null while it is closed. */
    brickId: string | null;

    /** Opens the menu on a brick, replacing whichever brick it was open on before. */
    open: (brickId: string) => void;
    /** Closes the menu, whether or not it was open. */
    close: () => void;
}

/**
 * Tracks the brick the action menu is open on, one at a time and by ID alone: the menu is placed
 * off the brick's `coords` entry in `useBrickLayoutStore`, so it follows a move, a scale change or
 * a fold below it, and a position held here would go stale on all three.
 */
export const useActionMenuStore = create<ActionMenuStore>()(
    subscribeWithSelector((set, get) => ({
        brickId: null,

        open: (brickId) => {
            if (get().brickId === brickId) return;

            set({ brickId });
        },

        close: () => {
            if (get().brickId === null) return;

            set({ brickId: null });
        },
    })),
);
