import type { Point, Size } from '@/@types/common.types';
import type { PaletteBrickConfig } from '@/@types/palette.types';
import type { TowerState } from '@/@types/workspace.types';
import { useConnectionPreviewStore } from '@/stores/connection-preview';
import { useWorkspaceScaleStore } from '@/stores/scale';
import { useWorkspaceStore } from '@/stores/workspace';
import { createBrickModel, wrapAsRootNode } from '@/utils/brick-model-factory';
import { listVisibleNodes, traverseTopDown } from '@/utils/tower-traversal';
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
 * Fallback maximum horizontal canvas width (in pixels) for grid search boundary calculation
 * when canvas bounds are not yet measured or in headless test environments.
 */
export const DEFAULT_MAX_CANVAS_WIDTH = 800;

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
 * Resolves the effective maximum horizontal canvas boundary for keyboard grid placement.
 * Checks the DOM for an active workspace canvas element if available.
 *
 * @returns The maximum horizontal width limit for placement in pixels.
 */
export function getCanvasMaxWidth(): number {
    if (typeof document !== 'undefined') {
        const canvas = document.querySelector('[data-workspace-canvas]');
        if (canvas && canvas.clientWidth > 0) {
            return canvas.clientWidth;
        }
    }
    return DEFAULT_MAX_CANVAS_WIDTH;
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
 * Creates a new TowerState representing a standalone tower for a given palette brick.
 *
 * @param brick - The palette brick configuration to instantiate.
 * @param position - Canvas-local position for the tower root.
 * @param scaleLevel - Optional scale level.
 * @returns A new TowerState instance.
 */
export function createPaletteTower(
    brick: PaletteBrickConfig,
    position: Point,
    scaleLevel?: 1 | 2 | 3,
): TowerState {
    const model = createBrickModel({ ...brick.brick, scaleLevel });

    return {
        id: crypto.randomUUID(),
        root: wrapAsRootNode(model),
        position,
    };
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
    let position = options.anchor ?? getCurrentPlacementPosition();
    const columnStep = options.columnStep ?? DEFAULT_COLUMN_STEP;
    const anchor = options.anchor ?? DEFAULT_PLACEMENT_ANCHOR;
    const towers = useWorkspaceStore.getState().towers;

    // Ensure placement does not overlap directly on an existing tower if no explicit anchor is given
    if (!options.anchor) {
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
    }

    const scaleLevel = useWorkspaceScaleStore.getState().level;
    const tower = createPaletteTower(config, position, scaleLevel);
    const towerId = tower.id;

    useWorkspaceStore.getState().createTower(tower);

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

const MARGIN = 16;
const GRID_STEP = 32;
const GAP = 8;
const FALLBACK_SIZE: Size = { w: 120, h: 48 };

/**
 * Returns the provided size or defaults to fallback dimensions if width or height is non-positive.
 *
 * @param size - The size dimensions to validate.
 * @returns Valid size dimensions with positive width and height.
 */
function sizeOrFallback(size: Size): Size {
    return {
        w: size.w > 0 ? size.w : FALLBACK_SIZE.w,
        h: size.h > 0 ? size.h : FALLBACK_SIZE.h,
    };
}

/**
 * Determines whether two positioned rectangular items overlap, taking collision gap into account.
 *
 * @param first - First positioned bounding rectangle.
 * @param second - Second positioned bounding rectangle.
 * @returns True if the items overlap.
 */
function overlaps(
    first: { position: Point; size: Size },
    second: { position: Point; size: Size },
): boolean {
    return (
        first.position.x < second.position.x + second.size.w + GAP &&
        first.position.x + first.size.w + GAP > second.position.x &&
        first.position.y < second.position.y + second.size.h + GAP &&
        first.position.y + first.size.h + GAP > second.position.y
    );
}

/**
 * Options for computing keyboard grid placement coordinates.
 */
export interface KeyboardPlacementOptions {
    /** Maximum horizontal canvas width boundary in pixels. */
    maxCanvasWidth?: number;
    /** Maximum vertical canvas height boundary in pixels. */
    maxCanvasHeight?: number;
    /** Current workspace viewport pan offset in pixels. */
    viewportOffset?: Point;
}

/**
 * Searches for a free coordinate on the canvas for placing a brick via keyboard activation,
 * staying within visible viewport bounds and checking all visible nodes across existing towers.
 *
 * @param towers - The current map of towers in the workspace.
 * @param size - The dimensions of the brick to be placed.
 * @param options - Optional configuration or maximum canvas width boundary.
 * @returns The computed free point coordinates in workspace canvas space.
 */
export function findKeyboardPlacement(
    towers: Record<string, TowerState>,
    size: Size,
    options?: number | KeyboardPlacementOptions,
): Point {
    const candidateSize = sizeOrFallback(size);
    const opts: KeyboardPlacementOptions =
        typeof options === 'number' ? { maxCanvasWidth: options } : (options ?? {});
    const effectiveMaxWidth = opts.maxCanvasWidth ?? getCanvasMaxWidth();
    const effectiveMaxHeight = opts.maxCanvasHeight ?? getCanvasMaxHeight();
    const viewportOffset = opts.viewportOffset ?? { x: 0, y: 0 };

    const occupied: { position: Point; size: Size }[] = [];
    for (const tower of Object.values(towers)) {
        for (const node of listVisibleNodes(tower.root)) {
            if (node.model.dims.w === 0 || node.model.dims.h === 0) {
                node.model.computeDims();
            }
        }
        const nodes = traverseTopDown(tower.root, tower.position);
        for (const node of nodes) {
            occupied.push({
                position: node.model.position,
                size: sizeOrFallback(node.model.dims),
            });
        }
    }

    for (let row = 0; ; row++) {
        const visibleY = MARGIN + row * GRID_STEP;

        // Stop searching if candidate row extends past the vertical canvas boundary
        if (visibleY + candidateSize.h > effectiveMaxHeight && row > 0) {
            break;
        }

        for (let column = 0; column < 100; column++) {
            const visibleX = MARGIN + column * GRID_STEP;

            // Wrap to next row if candidate column extends past the horizontal canvas boundary
            if (visibleX + candidateSize.w > effectiveMaxWidth && column > 0) {
                break;
            }

            // Convert visible canvas position into workspace coordinates using viewport offset
            const position = {
                x: visibleX - viewportOffset.x,
                y: visibleY - viewportOffset.y,
            };

            const candidate = { position, size: candidateSize };

            if (!occupied.some((item) => overlaps(candidate, item))) return position;
        }
    }

    // Graceful fallback to the visible viewport top-left if all grid positions are occupied
    return {
        x: MARGIN - viewportOffset.x,
        y: MARGIN - viewportOffset.y,
    };
}
