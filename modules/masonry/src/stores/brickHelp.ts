import { create } from 'zustand';

export interface BrickHelpStore {
    /** The ID of the brick whose help text is showing, or null while none is. */
    brickId: string | null;

    /** Shows the help text for a brick, replacing whichever brick it was showing before. */
    show: (brickId: string) => void;
    /** Hides the help text, whether or not it was showing. */
    hide: () => void;
}

/**
 * Tracks the brick whose tooltip the pie menu's help wedge has opened, by ID alone: the text is
 * placed off the brick on screen, so it follows a move or a scale change instead of going stale.
 *
 * Separate from `useActionMenuStore` because the menu closes as a wedge runs, and the help text
 * has to outlive it.
 */
export const useBrickHelpStore = create<BrickHelpStore>()((set, get) => ({
    brickId: null,

    show: (brickId) => {
        if (get().brickId === brickId) return;

        set({ brickId });
    },

    hide: () => {
        if (get().brickId === null) return;

        set({ brickId: null });
    },
}));
