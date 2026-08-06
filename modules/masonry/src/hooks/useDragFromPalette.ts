import type { DragEvent } from '@interactjs/types';
import type { RefObject } from 'react';

import interact from 'interactjs';
import { useEffect, useRef } from 'react';

import type { Point } from '@/@types/common.types';
import type { PaletteBrickConfig } from '@/@types/palette.types';

import { usePaletteDragStore } from '@/stores/palette';
import { useWorkspaceScaleStore } from '@/stores/scale';
import { useWorkspaceStore } from '@/stores/workspace';
import { createBrickModel, wrapAsRootNode } from '@/utils/brick-model-factory';

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Delegated CSS selector matching palette brick slots (see `BrickSlot`). Delegation covers slots
 * mounted after binding — search results, classification switches — without rebinding.
 */
export const PALETTE_DRAG_SOURCE_SELECTOR = '.palette-brick-slot';

/**
 * Converts a client (viewport) point to coordinates local to an element whose client-space
 * top-left is `origin`, compensating for `grabOffset` so the result is the dragged element's
 * top-left corner rather than the pointer position.
 */
export function clientToLocalPoint(client: Point, origin: Point, grabOffset: Point): Point {
    return {
        x: client.x - origin.x - grabOffset.x,
        y: client.y - origin.y - grabOffset.y,
    };
}

// ─────────────────────────────────────────────────────────────────────────────

export interface UseDragFromPaletteOptions {
    /** The workspace root element; scopes the delegated drag selector and hosts the drag ghost. */
    rootRef: RefObject<HTMLElement | null>;
    /** The canvas element towers live in; a drop lands relative to its top-left corner. */
    canvasRef: RefObject<HTMLElement | null>;
    /** The ghost's positioning node inside the root; transforms are written to it imperatively. */
    ghostRef: RefObject<HTMLElement | null>;
    /** Lookup from a palette entry's id (a slot's `data-brick-id`) to its full config. */
    bricksById: Record<string, PaletteBrickConfig>;
}

/**
 * Makes every palette brick slot a drag source that spawns a new tower in the workspace canvas.
 *
 * Owns the single interact.js draggable for the whole palette: one delegated selector scoped to
 * the workspace root, bound once on mount and released via `interactable.unset()`. The slot never
 * moves; a ghost overlay follows the pointer, and only a release inside the canvas commits a new
 * one-brick tower at the drop's canvas-local coordinates.
 */
export function useDragFromPalette(options: UseDragFromPaletteOptions) {
    const { rootRef, canvasRef, ghostRef, bricksById } = options;

    const { startDrag, endDrag } = usePaletteDragStore.getState();
    const { createTower } = useWorkspaceStore.getState();

    // interact.js binds its listeners once below, so route config lookups through a ref instead
    // of the closed-over map — palette config changes then don't require rebinding.
    const bricksByIdRef = useRef(bricksById);
    bricksByIdRef.current = bricksById;

    // In-flight drag payload; null whenever no palette drag is active.
    const dragRef = useRef<{ config: PaletteBrickConfig; grabOffset: Point } | null>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        // Scope the delegated selector to the workspace root so we don't bind slots belonging to
        // other Workspace instances (or anything else in the DOM).
        const interactable = interact(PALETTE_DRAG_SOURCE_SELECTOR, { context: root }).draggable({
            listeners: {
                start(event: DragEvent) {
                    const slot = event.target as HTMLElement;
                    const ghost = ghostRef.current;

                    const brickId = slot.getAttribute('data-brick-id');
                    const config = brickId ? bricksByIdRef.current[brickId] : undefined;
                    if (!config || !rootRef.current || !ghost) return;

                    const slotRect = slot.getBoundingClientRect();
                    const rootRect = rootRef.current.getBoundingClientRect();

                    // Where inside the slot the pointer grabbed, so the ghost (and the eventual
                    // drop) tracks the grab point instead of snapping its corner to the cursor.
                    const grabOffset: Point = {
                        x: event.clientX0 - slotRect.left,
                        y: event.clientY0 - slotRect.top,
                    };
                    dragRef.current = { config, grabOffset };

                    // Place the ghost exactly over the slot, in root-local coordinates.
                    const start = clientToLocalPoint(
                        { x: event.clientX0, y: event.clientY0 },
                        { x: rootRect.left, y: rootRect.top },
                        grabOffset,
                    );
                    ghost.dataset.x = String(start.x);
                    ghost.dataset.y = String(start.y);
                    ghost.style.transform = `translate(${start.x}px, ${start.y}px)`;
                    ghost.style.display = 'block';

                    // Mounts the ghost's brick preview.
                    startDrag(config);
                },
                move(event: DragEvent) {
                    const ghost = ghostRef.current;
                    if (!ghost || !dragRef.current) return;

                    // Accumulate position on the DOM node itself (not React state) so each
                    // pointermove updates the transform directly instead of triggering a
                    // re-render per pixel; dataset.x/y is the running total between events.
                    const x = (parseFloat(ghost.dataset.x ?? '0') || 0) + event.dx;
                    const y = (parseFloat(ghost.dataset.y ?? '0') || 0) + event.dy;
                    ghost.style.transform = `translate(${x}px, ${y}px)`;
                    ghost.dataset.x = String(x);
                    ghost.dataset.y = String(y);
                },
                end(event: DragEvent) {
                    const drag = dragRef.current;
                    dragRef.current = null;

                    // Ghost goes away on drop and cancel alike.
                    if (ghostRef.current) ghostRef.current.style.display = 'none';
                    endDrag();

                    const canvas = canvasRef.current;
                    if (!drag || !canvas) return;

                    // Only a release with the pointer inside the canvas rect commits a drop.
                    const canvasRect = canvas.getBoundingClientRect();
                    const isInsideCanvas =
                        event.clientX >= canvasRect.left &&
                        event.clientX <= canvasRect.right &&
                        event.clientY >= canvasRect.top &&
                        event.clientY <= canvasRect.bottom;
                    if (!isInsideCanvas) return;

                    // A brand-new model instance per drop — never reuse the palette entry's id.
                    // The level is read here rather than closed over, since these listeners bind
                    // once on mount; the Palette keeps its own size and does not follow it.
                    const model = createBrickModel({
                        ...drag.config.brick,
                        scaleLevel: useWorkspaceScaleStore.getState().level,
                    });
                    const position = clientToLocalPoint(
                        { x: event.clientX, y: event.clientY },
                        { x: canvasRect.left, y: canvasRect.top },
                        drag.grabOffset,
                    );

                    // Prevent placing the brick if it is still partially over the palette
                    if (position.x < 0) return;

                    createTower({
                        id: crypto.randomUUID(),
                        root: wrapAsRootNode(model),
                        position,
                    });
                },
            },
        });

        return () => {
            interactable.unset();

            // `end` never fires if we unmount mid-drag, so clear the in-flight payload and the
            // module-global drag store here too — else a stale drag leaks into the next mount.
            dragRef.current = null;
            endDrag();
        };
    }, [rootRef, canvasRef, ghostRef, startDrag, endDrag, createTower]);
}
