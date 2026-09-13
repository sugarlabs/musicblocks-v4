import type { DragEvent } from '@interactjs/types';
import type { RefObject } from 'react';

import interact from 'interactjs';
import { useEffect, useLayoutEffect } from 'react';

import type { Point } from '@/@types/common.types';

import { useWorkspaceViewportStore } from '@/stores/viewport';
import { TOWER_BRICK_SELECTOR } from '@/utils/constants';

// ─────────────────────────────────────────────────────────────────────────────

export interface UseCanvasPanOptions {
    /** The canvas element; a drag that starts on its empty background pans the workspace. */
    canvasRef: RefObject<HTMLElement | null>;
    /** The element inside the canvas that holds the towers; the offset becomes its transform. */
    viewportRef: RefObject<HTMLElement | null>;
}

/**
 * Lets the user pan the workspace by dragging the canvas background.
 *
 * Owns one interact.js draggable on the canvas element, bound once on mount and released via
 * `interactable.unset()`. A press that lands on a brick is left to that brick's own draggable
 * (`useBrickMove`) through `ignoreFrom` — the same way the fold toggle is kept out of a brick drag
 * — so only a press on empty background pans. Each move folds the pointer delta into the viewport
 * store.
 *
 * The store's offset is written to the viewport element's transform from a subscription rather
 * than through React state, for the same reason the drag ghost is positioned imperatively: a
 * re-render of every brick per pointer frame is exactly the cost a pan is meant to avoid. Going
 * through the store rather than straight from the gesture means anything else that writes the
 * offset — a home button, wheel scrolling, keyboard navigation — moves the canvas the same way.
 */
export function useCanvasPan(options: UseCanvasPanOptions) {
    const { canvasRef, viewportRef } = options;

    useLayoutEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const apply = (offset: Point) => {
            viewport.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
        };

        // The store may already be panned when the canvas mounts (a remount, say), so the first
        // write is not left to wait for the next change.
        apply(useWorkspaceViewportStore.getState().offset);

        return useWorkspaceViewportStore.subscribe((state) => state.offset, apply);
    }, [viewportRef]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const interactable = interact(canvas).draggable({
            // A brick's own draggable takes a press on the brick; without this the canvas would
            // start panning underneath it. The zoom buttons are the canvas' only other pointer
            // targets, and a press on them is a click, not a pan.
            ignoreFrom: `${TOWER_BRICK_SELECTOR}, button`,
            // The open hand is what advertises the background as draggable, so it shows on
            // hover and closes once the pan is under way. It never reaches a brick: `ignoreFrom`
            // stops the action there, so interact asks for no cursor at all.
            cursorChecker: (_action, _interactable, _element, interacting) =>
                interacting ? 'grabbing' : 'grab',
            listeners: {
                move(event: DragEvent) {
                    useWorkspaceViewportStore.getState().panBy({ x: event.dx, y: event.dy });
                },
            },
        });

        return () => {
            interactable.unset();
        };
    }, [canvasRef]);
}
