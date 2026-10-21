import { useEffect, useState } from 'react';

import type { Bounds } from '@/@types/common.types';

import { useBrickLayoutStore } from '@/stores/brick';
import { useWorkspaceScaleStore } from '@/stores/scale';
import { useWorkspaceViewportStore } from '@/stores/viewport';
import { useWorkspaceStore } from '@/stores/workspace';
import { brickHeadOnScreen, isInCanvasView } from '@/utils/brick-help';

/** Whether two boxes are the same box, so an unchanged measurement does not re-render. */
function isSameBox(a: Bounds | null, b: Bounds | null): boolean {
    if (a === null || b === null) return a === b;

    return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
}

/**
 * Where a brick's head is on screen, kept current while the brick moves under it: the canvas
 * panning, the workspace zooming, the brick being dragged, anything plugged into its slots
 * changing its width, or the canvas itself changing size, as it does when the palette beside it
 * folds away or the workspace goes fullscreen. Null once the brick is deleted or its head has left the canvas's view, so
 * that nothing points at it.
 *
 * Starts from `initial`, measured when the caller found the brick, and only measures again when
 * one of those changes. Each change is measured on the next animation frame rather than at once:
 * a pan writes its transform from a store subscription of its own and a zoom re-lays the bricks
 * out over a few commits, and by the next frame the page has caught up with both. Several changes
 * in one frame are measured once.
 *
 * @param brickId - the brick to follow
 * @param initial - where its head was when it was found
 * @returns where its head is now, or null when it cannot be pointed at
 */
export function useBrickHeadOnScreen(brickId: string, initial: Bounds | null): Bounds | null {
    const [head, setHead] = useState(initial);

    useEffect(() => {
        let frame = 0;

        const measure = () => {
            frame = 0;
            const now = brickHeadOnScreen(brickId);
            const next = now !== null && isInCanvasView(now) ? now : null;

            setHead((current) => (isSameBox(current, next) ? current : next));
        };

        const schedule = () => {
            if (frame === 0) frame = requestAnimationFrame(measure);
        };

        const unsubscribe = [
            useWorkspaceViewportStore.subscribe((state) => state.offset, schedule),
            useWorkspaceScaleStore.subscribe((state) => state.level, schedule),
            useBrickLayoutStore.subscribe((state) => state.coords, schedule),
            useWorkspaceStore.subscribe((state) => state.towers, schedule),
        ];
        window.addEventListener('resize', schedule);

        // The canvas can change size without the window doing so, such as when the palette beside
        // it folds away, and every brick on it shifts with it. Each step of an animated change
        // lands in its own frame, so the head is measured once a frame while it lasts.
        const canvas = document.querySelector('[data-workspace-canvas]');
        const canvasObserver =
            canvas !== null && typeof ResizeObserver !== 'undefined'
                ? new ResizeObserver(schedule)
                : null;
        if (canvas !== null) canvasObserver?.observe(canvas);

        return () => {
            unsubscribe.forEach((stop) => stop());
            window.removeEventListener('resize', schedule);
            canvasObserver?.disconnect();
            if (frame !== 0) cancelAnimationFrame(frame);
        };
    }, [brickId]);

    return head;
}
