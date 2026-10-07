import type { Point, Size } from '@/@types/common.types';
import { useBrickLayoutStore } from '@/stores/brick';
import { useWorkspaceViewportStore } from '@/stores/viewport';
import { useWorkspaceStore } from '@/stores/workspace';
import { AUTO_PAN_BAND, HOME_COLUMN_WIDTH, HOME_GAP } from '@/utils/constants';
import { measureTowerExtent, traverseTopDown } from '@/utils/tower-traversal';

/** The canvas's size, or null when there is no canvas or it has not been laid out yet. */
function canvasSize(canvas: HTMLElement | null): Size | null {
    if (!canvas) return null;

    const { width, height } = canvas.getBoundingClientRect();
    if (width === 0 || height === 0) return null;

    return { w: width, h: height };
}

/**
 * Where each tower goes, in v3's column layout: the width is split into columns and each tower goes
 * to the top of the shortest one. A tower wider than a column takes as many side by side as it
 * needs, so no two overlap.
 *
 * It starts `AUTO_PAN_BAND` in from the left and top, so dropping a brick onto a tower there does not
 * start auto scroll.
 */
function columnLayout(sizes: Size[], width: number): Point[] {
    // At least one column, so a canvas narrower than the margin still gets real positions.
    const room = Math.max(HOME_COLUMN_WIDTH, width - AUTO_PAN_BAND);
    const count = Math.max(1, Math.floor(room / HOME_COLUMN_WIDTH));
    const columnWidth = room / count;
    const heights: number[] = new Array(count).fill(AUTO_PAN_BAND);

    return sizes.map((size) => {
        const span = Math.min(count, Math.ceil((size.w + HOME_GAP) / columnWidth));

        // The run of `span` columns whose tallest is shortest, leftmost first.
        let first = 0;
        let top = Infinity;
        for (let i = 0; i + span <= count; i++) {
            const y = Math.max(...heights.slice(i, i + span));
            if (y < top) {
                first = i;
                top = y;
            }
        }
        heights.fill(top + size.h + HOME_GAP, first, first + span);

        return { x: AUTO_PAN_BAND + Math.round(first * columnWidth), y: top };
    });
}

/**
 * Whether Home has anything to do: the view is panned, or a tower reaches past an edge of the
 * canvas, the way v3's `checkBounds` lights its Home button.
 *
 * A tower too big for the canvas still reaches past an edge where Home puts it, so once every tower
 * is already in its spot there is nothing left to do either.
 */
export function isAwayFromHome(canvas: HTMLElement | null): boolean {
    const { offset } = useWorkspaceViewportStore.getState();
    if (offset.x !== 0 || offset.y !== 0) return true;

    const size = canvasSize(canvas);
    if (!size) return false;

    const { coords } = useBrickLayoutStore.getState();
    const towers = Object.values(useWorkspaceStore.getState().towers);
    const sizes = towers.map((tower) => measureTowerExtent(tower, coords));

    const isOffScreen = towers.some((tower, i) => {
        const { x, y } = tower.position;

        return x < 0 || y < 0 || x + sizes[i].w > size.w || y + sizes[i].h > size.h;
    });
    if (!isOffScreen) return false;

    const spots = columnLayout(sizes, size.w);

    return towers.some(
        (tower, i) => tower.position.x !== spots[i].x || tower.position.y !== spots[i].y,
    );
}

/**
 * Brings the program back into view the way v3's Home does: the view returns to the origin and
 * every tower is laid out in columns inside the canvas. Only tower positions change, never which
 * bricks there are or how they connect.
 *
 * Without a measured canvas only the view returns.
 */
export function goHome(canvas: HTMLElement | null): void {
    useWorkspaceViewportStore.getState().resetOffset();

    const size = canvasSize(canvas);
    const store = useWorkspaceStore.getState();
    const towers = Object.values(store.towers);
    if (!size || towers.length === 0) return;

    const { coords } = useBrickLayoutStore.getState();
    const spots = columnLayout(
        towers.map((tower) => measureTowerExtent(tower, coords)),
        size.w,
    );

    let isMoved = false;
    towers.forEach((tower, i) => {
        const spot = spots[i];
        if (spot.x === tower.position.x && spot.y === tower.position.y) return;

        isMoved = true;
        store.updateTowerPosition(tower.id, spot);
        // Positioned here rather than left to the layout, so the connectors are synced to where the
        // bricks are now and snapping keeps working.
        traverseTopDown(tower.root, spot);
        store.syncStatementConnectors(tower.id, tower.root);
        store.syncArgumentConnectors(tower.id, tower.root);
    });

    // Once for all the moves, so a single undo puts every tower back.
    if (!isMoved) return;
    import('@/stores/history').then(({ useWorkspaceHistoryStore }) => {
        useWorkspaceHistoryStore.getState().commit();
    });
}
