import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import {
    DEFAULT_SCALE_LEVEL,
    MAX_SCALE_LEVEL,
    MIN_SCALE_LEVEL,
    type ScaleLevel,
} from '@/utils/constants';

export interface WorkspaceScaleStore {
    /** The scale level every brick in the workspace is drawn at. */
    level: ScaleLevel;

    /** Sets the scale level, clamped to the levels `SCALE_LEVEL_CONFIG` defines. */
    setLevel: (level: number) => void;
    /** Steps up one level; a no-op at the highest level. */
    zoomIn: () => void;
    /** Steps down one level; a no-op at the lowest level. */
    zoomOut: () => void;
}

function clampLevel(level: number): ScaleLevel {
    return Math.min(Math.max(Math.round(level), MIN_SCALE_LEVEL), MAX_SCALE_LEVEL) as ScaleLevel;
}

/**
 * Tracks the workspace's scale level — one value for the whole workspace, never per tower, since
 * bricks move between towers and a tower whose bricks disagree on the level has connector geometry
 * that does not line up.
 *
 * The store clamps rather than trusting its callers, so no reader can index `SCALE_LEVEL_CONFIG`
 * with a level it does not define, and the control renders off `level` alone.
 */
export const useWorkspaceScaleStore = create<WorkspaceScaleStore>()(
    subscribeWithSelector((set, get) => ({
        level: DEFAULT_SCALE_LEVEL,

        setLevel: (level) => {
            const next = clampLevel(level);
            // Re-laying out every tower is expensive, so a clamped-away step must not notify.
            if (get().level === next) return;

            set({ level: next });
        },

        zoomIn: () => {
            get().setLevel(get().level + 1);
        },

        zoomOut: () => {
            get().setLevel(get().level - 1);
        },
    })),
);
