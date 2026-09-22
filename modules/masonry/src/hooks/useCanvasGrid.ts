import type { RefObject } from 'react';
import { useLayoutEffect } from 'react';

import { useWorkspaceScaleStore } from '@/stores/scale';
import { useWorkspaceViewportStore } from '@/stores/viewport';
import {
    applyGridStyle,
    calculateGridSpacing,
    clearGridStyle,
    generateGridBackgroundImage,
    generateGridBackgroundPosition,
} from '@/utils/workspace-grid';

export interface UseCanvasGridOptions {
    canvasRef: RefObject<HTMLElement | null>;
    visible?: boolean;
}

/**
 * Manages canvas grid background imperatively without re-rendering the workspace.
 */
export function useCanvasGrid(options: UseCanvasGridOptions): void {
    const { canvasRef, visible = true } = options;

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (!visible) {
            clearGridStyle(canvas);
            return;
        }

        const initialLevel = useWorkspaceScaleStore.getState().level;
        const initialOffset = useWorkspaceViewportStore.getState().offset;
        applyGridStyle(canvas, calculateGridSpacing(initialLevel), initialOffset);

        const unsubscribeViewport = useWorkspaceViewportStore.subscribe(
            (state) => state.offset,
            (offset) => {
                canvas.style.backgroundPosition = generateGridBackgroundPosition(offset);
            },
        );

        const unsubscribeScale = useWorkspaceScaleStore.subscribe(
            (state) => state.level,
            (level) => {
                canvas.style.backgroundImage = generateGridBackgroundImage(
                    calculateGridSpacing(level),
                );
            },
        );

        return () => {
            unsubscribeViewport();
            unsubscribeScale();
            clearGridStyle(canvas);
        };
    }, [canvasRef, visible]);
}
