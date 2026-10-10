import { useEffect, useState } from 'react';

import type { Bounds } from '@/@types/common.types';

import { useBrickLayoutStore } from '@/stores/brick';
import { useWorkspaceScaleStore } from '@/stores/scale';
import { useWorkspaceViewportStore } from '@/stores/viewport';
import { useWorkspaceStore } from '@/stores/workspace';
import { brickHeadOnScreen } from '@/utils/brick-help';

/** Whether two boxes are the same box, so an unchanged measurement does not re-render. */
function isSameBox(a: Bounds | null, b: Bounds | null): boolean {
    if (a === null || b === null) return a === b;

    return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
}

/**
 * Whether a brick's head can be pointed at: the middle of it, where an arrow would land, is inside
 * the canvas rather than panned out past one of its edges. A page with no canvas has nothing to
 * clip the head, so it counts as in view.
 *
 * @param head - the head's box on screen
 * @returns whether it is in the canvas's view
 */
function isInCanvasView(head: Bounds): boolean {
    const canvas = document.querySelector('[data-workspace-canvas]');
    if (canvas === null) return true;

    const view = canvas.getBoundingClientRect();
    const middle = head.y + head.h / 2;

    return (
        middle >= view.top &&
        middle <= view.bottom &&
        head.x + head.w > view.left &&
        head.x < view.right
    );
}

/**
 * Where a brick's head is on screen, kept current while the brick moves under it: the canvas
 * panning, the workspace zooming, the brick being dragged, or anything plugged into its slots
 * changing its width. Null once the brick is deleted or its head has left the canvas's view, so
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

        return () => {
            unsubscribe.forEach((stop) => stop());
            window.removeEventListener('resize', schedule);
            if (frame !== 0) cancelAnimationFrame(frame);
        };
    }, [brickId]);

    return head;
}
