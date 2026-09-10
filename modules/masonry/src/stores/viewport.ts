import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface WorkspaceViewportStore {
  /** The horizontal pan offset of the canvas (0 is default) */
  offsetX: number;
  /** The vertical pan offset of the canvas (0 is default) */
  offsetY: number;
  
  /** Sets the absolute viewport offset coordinates. */
  setOffset: (x: number, y: number) => void;
  /** Shifts the current viewport offset by relative deltas. */
  pan: (dx: number, dy: number) => void;
}

/**
 * Tracks the workspace's viewport pan offsets.
 * Used to translate the brick layer without moving static UI controls.
 */
export const useWorkspaceViewportStore = create<WorkspaceViewportStore>()(
  subscribeWithSelector((set) => ({
    offsetX: 0,
    offsetY: 0,
    
    setOffset: (x, y) => set({ offsetX: x, offsetY: y }),
    
    pan: (dx, dy) => set((state) => ({ 
      offsetX: state.offsetX + dx, 
      offsetY: state.offsetY + dy 
    })),
  }))
);