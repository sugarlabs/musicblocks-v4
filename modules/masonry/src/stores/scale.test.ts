// Unit tests for the workspace scale store slice. Store-only logic — no DOM — so this runs in the
// node environment. The bounds are asserted against MIN_SCALE_LEVEL/MAX_SCALE_LEVEL rather than
// literals, so adding a level to SCALE_LEVEL_CONFIG cannot quietly turn these into no-op tests.

import { afterEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_SCALE_LEVEL, MAX_SCALE_LEVEL, MIN_SCALE_LEVEL } from '@/utils/constants';

import { useWorkspaceScaleStore } from './scale';

// -------------------------------------------------------------------------------------------------

afterEach(() => {
    useWorkspaceScaleStore.setState({ level: DEFAULT_SCALE_LEVEL });
});

// -------------------------------------------------------------------------------------------------

describe('useWorkspaceScaleStore', () => {
    it('starts at the default scale level', () => {
        expect(useWorkspaceScaleStore.getState().level).toBe(DEFAULT_SCALE_LEVEL);
    });

    it('setLevel takes a level the config defines', () => {
        useWorkspaceScaleStore.getState().setLevel(MAX_SCALE_LEVEL);

        expect(useWorkspaceScaleStore.getState().level).toBe(MAX_SCALE_LEVEL);
    });

    it('setLevel clamps a level outside the config to the nearest bound', () => {
        useWorkspaceScaleStore.getState().setLevel(MAX_SCALE_LEVEL + 5);
        expect(useWorkspaceScaleStore.getState().level).toBe(MAX_SCALE_LEVEL);

        useWorkspaceScaleStore.getState().setLevel(MIN_SCALE_LEVEL - 5);
        expect(useWorkspaceScaleStore.getState().level).toBe(MIN_SCALE_LEVEL);
    });

    it('setLevel rounds a fractional level to one the config defines', () => {
        useWorkspaceScaleStore.getState().setLevel(MAX_SCALE_LEVEL - 0.4);
        expect(useWorkspaceScaleStore.getState().level).toBe(MAX_SCALE_LEVEL);

        useWorkspaceScaleStore.getState().setLevel(MIN_SCALE_LEVEL + 0.4);
        expect(useWorkspaceScaleStore.getState().level).toBe(MIN_SCALE_LEVEL);
    });

    it('zoomIn and zoomOut step one level from the default', () => {
        useWorkspaceScaleStore.getState().zoomIn();
        expect(useWorkspaceScaleStore.getState().level).toBe(DEFAULT_SCALE_LEVEL + 1);

        useWorkspaceScaleStore.setState({ level: DEFAULT_SCALE_LEVEL });

        useWorkspaceScaleStore.getState().zoomOut();
        expect(useWorkspaceScaleStore.getState().level).toBe(DEFAULT_SCALE_LEVEL - 1);
    });

    it('a step past a bound holds the level and notifies no subscriber', () => {
        const listener = vi.fn();
        const unsubscribe = useWorkspaceScaleStore.subscribe(listener);

        useWorkspaceScaleStore.setState({ level: MAX_SCALE_LEVEL });
        listener.mockClear();

        useWorkspaceScaleStore.getState().zoomIn();
        expect(useWorkspaceScaleStore.getState().level).toBe(MAX_SCALE_LEVEL);

        useWorkspaceScaleStore.setState({ level: MIN_SCALE_LEVEL });
        listener.mockClear();

        useWorkspaceScaleStore.getState().zoomOut();
        expect(useWorkspaceScaleStore.getState().level).toBe(MIN_SCALE_LEVEL);

        expect(listener).not.toHaveBeenCalled();

        unsubscribe();
    });
});
