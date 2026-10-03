import { beforeEach, describe, expect, it } from 'vitest';

import type { PaletteBrickConfig } from '@/@types/palette.types';
import type { TowerStatementNode } from '@/@types/tower.types';
import type { TowerState } from '@/@types/workspace.types';
import { useWorkspaceScaleStore } from '@/stores/scale';
import { useWorkspaceStore } from '@/stores/workspace';
import { createBrickModel, wrapAsRootNode } from './brick-model-factory';
import {
    DEFAULT_MAX_CANVAS_HEIGHT,
    DEFAULT_PLACEMENT_ANCHOR,
    findKeyboardPlacement,
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

const brick = {
    kind: 'statement' as const,
    widget: { type: 'label' as const, text: 'Note' },
    colorsDefault: { background: '#e07a5f', foreground: '#ffffff', border: '#00000033' },
    tooltipText: 'play a note',
    paramArgs: [],
};

function tower(position: { x: number; y: number }): TowerState {
    return {
        id: 'existing',
        root: wrapAsRootNode(createBrickModel(brick)),
        position,
    };
}

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

    describe('findKeyboardPlacement', () => {
        it('uses the fixed top-left insertion position when it is free', () => {
            expect(findKeyboardPlacement({}, { w: 120, h: 48 })).toEqual({ x: 16, y: 16 });
        });

        it('moves to the next free grid position when the insertion position is occupied', () => {
            expect(
                findKeyboardPlacement({ existing: tower({ x: 16, y: 16 }) }, { w: 120, h: 48 }),
            ).toEqual({ x: 144, y: 16 });
        });

        it('wraps to the next row when candidate columns exceed maxCanvasWidth', () => {
            expect(
                findKeyboardPlacement(
                    { existing: tower({ x: 16, y: 16 }) },
                    { w: 120, h: 48 },
                    200,
                ),
            ).toEqual({ x: 16, y: 80 });
        });

        it('offsets placement coordinates by current viewport pan offset to keep brick in visible viewport', () => {
            expect(
                findKeyboardPlacement(
                    {},
                    { w: 120, h: 48 },
                    { viewportOffset: { x: -100, y: -50 } },
                ),
            ).toEqual({ x: 116, y: 66 });
        });

        it('checks collision against all visible connected nodes in an existing tower', () => {
            const rootNode = wrapAsRootNode(createBrickModel(brick)) as TowerStatementNode;
            const childNode = wrapAsRootNode(createBrickModel(brick)) as TowerStatementNode;
            rootNode.next = childNode;
            const multiBrickTower: TowerState = {
                id: 'multi',
                root: rootNode,
                position: { x: 16, y: 16 },
            };

            const placement = findKeyboardPlacement(
                { multi: multiBrickTower },
                { w: 120, h: 48 },
                { maxCanvasWidth: 200 },
            );
            // Root is at (16, 16) and child sits below it; the placement avoids both
            expect(placement).toEqual({ x: 16, y: 112 });
        });

        it('bounds the search within maxCanvasHeight and falls back gracefully when visible canvas is full', () => {
            const placement = findKeyboardPlacement(
                { existing: tower({ x: 16, y: 16 }) },
                { w: 120, h: 48 },
                { maxCanvasWidth: 150, maxCanvasHeight: 60 },
            );
            expect(placement).toEqual({ x: 16, y: 16 });
        });
    });
});
