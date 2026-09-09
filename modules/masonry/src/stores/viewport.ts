import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { Point } from '@/@types/common.types';
import type { TowerState } from '@/@types/workspace.types';

export const PAN_STEP = 50;
export const FAST_PAN_STEP = 100;
export const PAGE_PAN_STEP = 300;

export interface ViewportStore {
  /** The current canvas viewport pan offset in pixels. */
  offset: Point;

  /** Pans the viewport by the given relative (dx, dy) delta. */
  panBy: (delta: Point) => void;

  /** Directly sets the viewport offset to a specified coordinate. */
  setOffset: (offset: Point) => void;

  /** Resets the viewport offset to the origin (0, 0). */
  resetOffset: () => void;

  /** Pans the viewport so the bounding extent of all towers is in view. */
  panToExtent: (towers: Record<string, TowerState>) => void;
}

/**
 * Tracks the canvas viewport pan offset.
 *
 * Panning translates the world layer containing towers and snapping overlays while
 * keeping HUD elements (such as scale controls and the trash bucket) anchored in viewport space.
 */
export const useViewportStore = create<ViewportStore>()(
  subscribeWithSelector((set) => ({
    offset: { x: 0, y: 0 },

    panBy: (delta) => {
      set((state) => ({
        offset: {
          x: state.offset.x + delta.x,
          y: state.offset.y + delta.y,
        },
      }));
    },

    setOffset: (offset) => {
      set({ offset });
    },

    resetOffset: () => {
      set({ offset: { x: 0, y: 0 } });
    },

    panToExtent: (towers) => {
      const towerList = Object.values(towers);
      if (towerList.length === 0) {
        set({ offset: { x: 0, y: 0 } });
        return;
      }

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      for (const tower of towerList) {
        minX = Math.min(minX, tower.position.x);
        minY = Math.min(minY, tower.position.y);
        maxX = Math.max(maxX, tower.position.x);
        maxY = Math.max(maxY, tower.position.y);
      }

      // Center/pan to bring the farthest extent into the top-left quadrant of the screen
      set({
        offset: {
          x: Math.round(-maxX + 100),
          y: Math.round(-maxY + 100),
        },
      });
    },
  })),
);
