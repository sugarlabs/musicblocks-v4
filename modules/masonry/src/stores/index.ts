import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { Point } from '@/@types/common.types';
import type { PaletteBrickConfig } from '@/@types/palette.types';
import type { TowerState } from '@/@types/workspace.types';

export interface BrickLayoutStore {
    /** Position per brick, keyed by brick (node model) id. */
    coords: Record<string, Point>;
    /** Per-brick, whether ready for rendering, keyed by brick (node model) id. */
    ready: Record<string, boolean>;

    /** Sets a single brick's coordinates. */
    setCoords(id: string, point: Point): void;
    /** Merges a batch of per-brick coordinates into `coords`. */
    setCoords(batch: Record<string, Point>): void;
    /** Merges a batch of per-brick ready flags into `ready`. */
    setReady: (batch: Record<string, boolean>) => void;
}

/**
 * Tracks the on-canvas layout of every brick, keyed by id.
 *
 * `subscribeWithSelector` is used so consumers outside React (e.g. imperative layout code) can
 * subscribe to a single brick's coords in isolation, not just whole-store changes.
 */
export const useBrickLayoutStore = create<BrickLayoutStore>()(
    subscribeWithSelector((set) => ({
        coords: {},
        ready: {},

        setCoords: ((idOrBatch: string | Record<string, Point>, point?: Point) => {
            const batch = typeof idOrBatch === 'string' ? { [idOrBatch]: point! } : idOrBatch;
            set((state) => ({ coords: { ...state.coords, ...batch } }));
        }) as BrickLayoutStore['setCoords'],

        setReady: (batch) => set((state) => ({ ready: { ...state.ready, ...batch } })),
    })),
);

export interface WorkspaceStore {
    /** Record of all towers currently in the workspace, keyed by their unique ID */
    towers: Record<string, TowerState>;
    /** Adds a new tower to the workspace */
    addTower: (tower: TowerState) => void;
    /** Removes a tower from the workspace by its ID */
    removeTower: (id: string) => void;
    /** Updates the position of an existing tower */
    updateTowerPosition: (id: string, position: Point) => void;
}

/**
 * Tracks the state of the workspace, including all towers positioned within it.
 */
export const useWorkspaceStore = create<WorkspaceStore>()(
    subscribeWithSelector((set) => ({
        towers: {},
        addTower: (tower) =>
            set((state) => ({
                towers: { ...state.towers, [tower.id]: tower },
            })),
        removeTower: (id) =>
            set((state) => {
                const newTowers = { ...state.towers };
                delete newTowers[id];
                return { towers: newTowers };
            }),
        updateTowerPosition: (id, position) =>
            set((state) => {
                if (!state.towers[id]) return state;
                return {
                    towers: {
                        ...state.towers,
                        [id]: { ...state.towers[id], position },
                    },
                };
            }),
    })),
);

export interface PaletteDragStore {
    /** The palette entry currently being dragged, or null when no palette drag is active. */
    dragged: PaletteBrickConfig | null;
    /** Marks a palette drag as active, carrying the dragged entry's config as its payload. */
    startDrag: (config: PaletteBrickConfig) => void;
    /** Clears the active palette drag, whether the drop was committed or cancelled. */
    endDrag: () => void;
}

/**
 * Tracks the palette drag in progress — only the dragged entry's config, which mounts/unmounts
 * the drag ghost's brick preview. Per-frame positions deliberately bypass the store; the drag
 * hook writes them straight to the ghost's DOM node so pointer moves never re-render React.
 */
export const usePaletteDragStore = create<PaletteDragStore>()(
    subscribeWithSelector((set) => ({
        dragged: null,
        startDrag: (config) => set({ dragged: config }),
        endDrag: () => set({ dragged: null }),
    })),
);
