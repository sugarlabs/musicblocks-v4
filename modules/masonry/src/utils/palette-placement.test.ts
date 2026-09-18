import { beforeEach, describe, expect, it } from 'vitest';

import type { PaletteBrickConfig } from '@/@types/palette.types';
import { useWorkspaceScaleStore } from '@/stores/scale';
import { useWorkspaceStore } from '@/stores/workspace';
import {
    DEFAULT_MAX_CANVAS_HEIGHT,
    DEFAULT_PLACEMENT_ANCHOR,
    getCanvasMaxHeight,
    getCurrentPlacementPosition,
    getNextPlacementPosition,
    placeBrickFromPalette,
    setPlacementPosition,
} from './palette-placement';

const mockPaletteBrick: PaletteBrickConfig = {
    id: 'test-palette-brick-1',
    name: 'Play Note',
    description: 'Plays a note',
    brick: {
        kind: 'statement',
        widget: { type: 'label', text: 'Play Note' },
        colorsDefault: { background: '#ff0000', foreground: '#ffffff', border: '#cc0000' },
        tooltipText: 'Play a note',
        hasConnectionPrev: true,
        hasConnectionNext: true,
    },
};

describe('palette-placement utils', () => {
    beforeEach(() => {
        setPlacementPosition(DEFAULT_PLACEMENT_ANCHOR);
        useWorkspaceStore.setState({ towers: {} });
        useWorkspaceScaleStore.getState().setLevel(1);
    });

    describe('getCanvasMaxHeight', () => {
        it('returns default max canvas height in headless environment when no canvas DOM exists', () => {
            expect(getCanvasMaxHeight()).toBe(DEFAULT_MAX_CANVAS_HEIGHT);
        });
    });

    describe('getNextPlacementPosition', () => {
        it('cascades downwards by default step (0, 60)', () => {
            const next = getNextPlacementPosition({ x: 20, y: 20 });
            expect(next).toEqual({ x: 20, y: 80 });
        });

        it('cascades multiple steps', () => {
            let pos = { x: 20, y: 20 };
            pos = getNextPlacementPosition(pos);
            expect(pos).toEqual({ x: 20, y: 80 });
            pos = getNextPlacementPosition(pos);
            expect(pos).toEqual({ x: 20, y: 140 });
        });

        it('wraps to next column when next position exceeds maxHeight', () => {
            const pos = { x: 20, y: 560 };
            const next = getNextPlacementPosition(pos, { maxHeight: 600 });
            expect(next).toEqual({ x: 200, y: 20 });
            expect(next).not.toEqual(DEFAULT_PLACEMENT_ANCHOR);
        });

        it('custom anchor, step, and columnStep can be configured', () => {
            const customAnchor = { x: 50, y: 50 };
            const customStep = { x: 10, y: 40 };
            const customColumnStep = { x: 100, y: 0 };
            const next = getNextPlacementPosition(customAnchor, {
                anchor: customAnchor,
                step: customStep,
                columnStep: customColumnStep,
                maxHeight: 100,
            });
            expect(next).toEqual({ x: 60, y: 90 });

            const wrapped = getNextPlacementPosition(next, {
                anchor: customAnchor,
                step: customStep,
                columnStep: customColumnStep,
                maxHeight: 100,
            });
            expect(wrapped).toEqual({ x: 160, y: 50 });
        });
    });

    describe('placeBrickFromPalette', () => {
        it('creates a new tower at current placement position and advances cascade position', () => {
            expect(getCurrentPlacementPosition()).toEqual(DEFAULT_PLACEMENT_ANCHOR);

            const { towerId, position } = placeBrickFromPalette(mockPaletteBrick);

            expect(position).toEqual(DEFAULT_PLACEMENT_ANCHOR);
            const tower = useWorkspaceStore.getState().towers[towerId];
            expect(tower).toBeDefined();
            expect(tower.position).toEqual(DEFAULT_PLACEMENT_ANCHOR);
            expect(tower.root.model.kind).toBe('statement');

            // Next placement should be cascaded
            expect(getCurrentPlacementPosition()).toEqual({ x: 20, y: 80 });
        });

        it('creates separate standalone towers on multiple calls', () => {
            const res1 = placeBrickFromPalette(mockPaletteBrick);
            const res2 = placeBrickFromPalette(mockPaletteBrick);

            expect(res1.position).toEqual({ x: 20, y: 20 });
            expect(res2.position).toEqual({ x: 20, y: 80 });

            const towers = useWorkspaceStore.getState().towers;
            expect(Object.keys(towers).length).toBe(2);
            expect(towers[res1.towerId]).toBeDefined();
            expect(towers[res2.towerId]).toBeDefined();
        });

        it('ensures wrapped placement does not overlap the existing anchor tower', () => {
            const first = placeBrickFromPalette(mockPaletteBrick);
            expect(first.position).toEqual(DEFAULT_PLACEMENT_ANCHOR);

            // Advance cascade to position at wrap threshold
            setPlacementPosition({ x: 20, y: 560 });
            // This placement places at (20, 560) and wraps the next placement to the next column
            placeBrickFromPalette(mockPaletteBrick, { maxHeight: 600 });

            // The wrapped placement lands in the next column, non-overlapping the anchor tower
            const wrapped = placeBrickFromPalette(mockPaletteBrick, { maxHeight: 600 });
            expect(wrapped.position).not.toEqual(first.position);
            expect(wrapped.position.x).toBeGreaterThan(first.position.x);
            expect(wrapped.position).toEqual({ x: 200, y: 20 });
        });
    });
});
