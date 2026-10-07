import { create } from 'zustand';

import type { BrickHelp } from '@/utils/brick-help';

export interface BrickHelpStore {
    /** The help the panel is showing, or null while it is closed. */
    help: BrickHelp | null;

    /** Opens the panel on this help, replacing whatever it was showing. */
    show: (help: BrickHelp) => void;
    /** Closes the panel, whether or not it was open. */
    hide: () => void;
}

/**
 * The help the pie menu's help wedge has opened.
 *
 * Separate from `useActionMenuStore` because the menu closes as a wedge runs, and the help panel
 * has to outlive it. It holds a snapshot of the brick's help rather than the brick's id, so the
 * panel stays as it was opened even if the brick is then moved, edited or deleted.
 */
export const useBrickHelpStore = create<BrickHelpStore>()((set, get) => ({
    help: null,

    show: (help) => set({ help }),

    hide: () => {
        if (get().help === null) return;

        set({ help: null });
    },
}));
