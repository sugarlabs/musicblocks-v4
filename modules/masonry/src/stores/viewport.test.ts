// Unit tests for the workspace viewport store slice. Store-only logic — no DOM — so this runs in
// the node environment; the transform the offset ends up in is covered by useCanvasPan's tests.

import { afterEach, describe, expect, it, vi } from 'vitest';

import { useWorkspaceViewportStore } from './viewport';

// -------------------------------------------------------------------------------------------------

afterEach(() => {
    useWorkspaceViewportStore.setState({ offset: { x: 0, y: 0 } });
});

// -------------------------------------------------------------------------------------------------

describe('useWorkspaceViewportStore', () => {
    it('starts unpanned', () => {
        expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
    });

    it('panBy accumulates one delta after another', () => {
        const { panBy } = useWorkspaceViewportStore.getState();

        panBy({ x: 10, y: 5 });
        panBy({ x: 2.5, y: 7 });

        expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 12.5, y: 12 });
    });

    it('setOffset moves the viewport to an absolute offset', () => {
        useWorkspaceViewportStore.getState().panBy({ x: 40, y: 40 });

        useWorkspaceViewportStore.getState().setOffset({ x: 120, y: 60 });

        expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 120, y: 60 });
    });

    it('setOffset keeps its own copy of the point', () => {
        const point = { x: 30, y: 30 };
        useWorkspaceViewportStore.getState().setOffset(point);

        point.x = 999;

        expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 30, y: 30 });
    });

    it('resetOffset returns the viewport to the origin', () => {
        useWorkspaceViewportStore.getState().panBy({ x: 300, y: 200 });

        useWorkspaceViewportStore.getState().resetOffset();

        expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
    });

    it('stops at the origin instead of panning back past it', () => {
        // Pulling the canvas back beyond where it started would put the top-left of the program
        // out of reach.
        useWorkspaceViewportStore.getState().setOffset({ x: -200, y: -120 });

        expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
    });

    it('bounds each axis on its own, leaving the other free', () => {
        useWorkspaceViewportStore.getState().setOffset({ x: 80, y: -60 });

        expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 80, y: 0 });
    });

    it('panBy cannot walk past the origin one delta at a time', () => {
        const { panBy } = useWorkspaceViewportStore.getState();

        panBy({ x: 100, y: 100 });
        panBy({ x: -300, y: -300 });

        // Panning back stops at the origin rather than banking the overshoot for later.
        expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: 0 });

        panBy({ x: 25, y: 25 });
        expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 25, y: 25 });
    });

    it('a pan clamped away at the origin notifies no subscriber', () => {
        const listener = vi.fn();
        const unsubscribe = useWorkspaceViewportStore.subscribe(listener);

        // Already at the origin, so there is nothing for the canvas transform to follow.
        useWorkspaceViewportStore.getState().panBy({ x: -40, y: -40 });

        expect(listener).not.toHaveBeenCalled();
        unsubscribe();
    });

    it('a write that changes nothing notifies no subscriber', () => {
        const listener = vi.fn();
        const unsubscribe = useWorkspaceViewportStore.subscribe(listener);

        useWorkspaceViewportStore.getState().setOffset({ x: 50, y: 20 });
        expect(listener).toHaveBeenCalledTimes(1);

        useWorkspaceViewportStore.getState().panBy({ x: 0, y: 0 });
        useWorkspaceViewportStore.getState().setOffset({ x: 50, y: 20 });
        expect(listener).toHaveBeenCalledTimes(1);

        useWorkspaceViewportStore.getState().resetOffset();
        expect(listener).toHaveBeenCalledTimes(2);

        useWorkspaceViewportStore.getState().resetOffset();
        expect(listener).toHaveBeenCalledTimes(2);

        unsubscribe();
    });
});
