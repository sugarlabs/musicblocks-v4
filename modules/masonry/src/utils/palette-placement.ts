import type { Point } from '@/@types/common.types';
import type { PaletteBrickConfig } from '@/@types/palette.types';
import { useConnectionPreviewStore } from '@/stores/connection-preview';
import { useWorkspaceScaleStore } from '@/stores/scale';
import { useWorkspaceStore } from '@/stores/workspace';
import { createBrickModel, wrapAsRootNode } from '@/utils/brick-model-factory';
import { tryConnect } from '@/hooks/useBrickMove';

/**
 * Default anchor coordinate (in canvas-local pixels) for click-to-place palette bricks.
 * Offset from (0, 0) to avoid overlapping the top-left canvas borders and controls.
 */
export const DEFAULT_PLACEMENT_ANCHOR: Point = { x: 20, y: 20 };

/**
 * Fixed coordinate offset step applied downwards on successive palette brick click-placements.
 */
export const DEFAULT_CASCADE_STEP: Point = { x: 0, y: 60 };

/**
 * Fixed coordinate offset step applied horizontally when cascade wraps to avoid overlapping
 * existing towers at the anchor position.
 */
export const DEFAULT_COLUMN_STEP: Point = { x: 180, y: 0 };

/**
 * Fallback maximum vertical canvas height (in pixels) for cascade wrap-around calculation
 * when canvas bounds are not yet measured or in headless test environments.
 */
export const DEFAULT_MAX_CANVAS_HEIGHT = 600;

/**
 * Configuration options for computing cascade placement coordinates.
 */
export interface CascadePlacementOptions {
    /** The starting anchor coordinates for the cascade (default: { x: 20, y: 20 }) */
    anchor?: Point;
    /** The step offset applied per cascade placement (default: { x: 0, y: 60 }) */
    step?: Point;
    /** The horizontal column offset applied when the cascade wraps (default: { x: 180, y: 0 }) */
    columnStep?: Point;
    /** The height limit of the canvas. When y + step.y exceeds this limit, cascade wraps */
    maxHeight?: number;
}

/**
 * Resolves the effective maximum vertical canvas boundary for wrapping.
 * Checks the DOM for an active workspace canvas element if available,
 * subtracting a bottom margin so bricks do not land off-screen or over bottom controls.
 *
 * @returns The maximum vertical height limit for cascade placement in pixels.
 */
export function getCanvasMaxHeight(): number {
    if (typeof document !== 'undefined') {
        const canvas = document.querySelector('[data-workspace-canvas]');
        if (canvas && canvas.clientHeight > 0) {
            // Leave a bottom margin of 80px for the brick height and comfort
            return Math.max(
                DEFAULT_PLACEMENT_ANCHOR.y + DEFAULT_CASCADE_STEP.y,
                canvas.clientHeight - 80,
            );
        }
    }
    return DEFAULT_MAX_CANVAS_HEIGHT;
}

/**
 * Computes the next placement position given the current position, applying the step offset
 * and wrapping to the next column when the cascade exceeds the vertical boundary.
 *
 * @param current - The current placement coordinate.
 * @param options - Optional cascade anchor, step, columnStep, and maxHeight bounds.
 * @returns The next placement coordinates.
 */
export function getNextPlacementPosition(
    current: Point,
    options: CascadePlacementOptions = {},
): Point {
    const anchor = options.anchor ?? DEFAULT_PLACEMENT_ANCHOR;
    const step = options.step ?? DEFAULT_CASCADE_STEP;
    const columnStep = options.columnStep ?? DEFAULT_COLUMN_STEP;
    const maxHeight = options.maxHeight ?? getCanvasMaxHeight();

    const nextY = current.y + step.y;
    // When the next position exceeds the available canvas vertical space, wrap to the next column
    if (nextY > maxHeight) {
        return {
            x: current.x + columnStep.x,
            y: anchor.y,
        };
    }

    return {
        x: current.x + step.x,
        y: nextY,
    };
}

/** Internal tracking state for the next click placement position */
let currentPlacementPosition: Point = { ...DEFAULT_PLACEMENT_ANCHOR };

/**
 * Gets the current placement coordinates for the next click-to-place action.
 *
 * @returns The current placement coordinates.
 */
export function getCurrentPlacementPosition(): Point {
    return { ...currentPlacementPosition };
}

/**
 * Sets or resets the current placement coordinates.
 *
 * @param position - The new placement coordinates to set (defaults to DEFAULT_PLACEMENT_ANCHOR).
 */
export function setPlacementPosition(position: Point = DEFAULT_PLACEMENT_ANCHOR): void {
    currentPlacementPosition = { ...position };
}

/**
 * Places a palette brick onto the workspace canvas at the current cascade position,
 * advances the cascade position, attempts connection, and records history.
 *
 * @param config - The palette brick configuration to instantiate.
 * @param options - Optional canvas height or cascade settings.
 * @returns An object containing the created towerId and the placement position coordinates.
 */
export function placeBrickFromPalette(
    config: PaletteBrickConfig,
    options: CascadePlacementOptions = {},
): { towerId: string; position: Point } {
    let position = getCurrentPlacementPosition();
    const columnStep = options.columnStep ?? DEFAULT_COLUMN_STEP;
    const anchor = options.anchor ?? DEFAULT_PLACEMENT_ANCHOR;
    const towers = useWorkspaceStore.getState().towers;

    // Ensure placement does not overlap directly on an existing tower
    while (
        Object.values(towers).some(
            (t) =>
                Math.abs(t.position.x - position.x) < 40 &&
                Math.abs(t.position.y - position.y) < 40,
        )
    ) {
        position = {
            x: position.x + columnStep.x,
            y: anchor.y,
        };
    }

    const scaleLevel = useWorkspaceScaleStore.getState().level;

    const model = createBrickModel({
        ...config.brick,
        scaleLevel,
    });

    const towerId = crypto.randomUUID();
    const root = wrapAsRootNode(model);

    useWorkspaceStore.getState().createTower({
        id: towerId,
        root,
        position,
    });

    // Advance the placement position for the subsequent click
    const nextPosition = getNextPlacementPosition(position, options);
    setPlacementPosition(nextPosition);

    useConnectionPreviewStore.getState().clearPreviewTarget();

    if (!tryConnect(towerId)) {
        const rootNode = useWorkspaceStore.getState().towers[towerId]?.root;
        if (rootNode) {
            queueMicrotask(() => {
                const store = useWorkspaceStore.getState();
                store.syncStatementConnectors(towerId, rootNode);
                store.syncArgumentConnectors(towerId, rootNode);
            });
        }
    }

    import('@/stores/history').then(({ useWorkspaceHistoryStore }) => {
        useWorkspaceHistoryStore.getState().commit();
    });

    return { towerId, position };
}
