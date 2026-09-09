import { beforeEach, describe, expect, it } from 'vitest';

import type { TowerState } from '@/@types/workspace.types';
import { makeEmptyStatement } from '@/mocks/tower';
import {
  FAST_PAN_STEP,
  PAGE_PAN_STEP,
  PAN_STEP,
  useViewportStore,
} from '@/stores/viewport';

describe('useViewportStore', () => {
  beforeEach(() => {
    useViewportStore.setState({ offset: { x: 0, y: 0 } });
  });

  it('initializes with offset at (0, 0)', () => {
    expect(useViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
  });

  it('pans by relative deltas with panBy', () => {
    const { panBy } = useViewportStore.getState();

    panBy({ x: PAN_STEP, y: 0 });
    expect(useViewportStore.getState().offset).toEqual({ x: PAN_STEP, y: 0 });

    panBy({ x: 0, y: -PAGE_PAN_STEP });
    expect(useViewportStore.getState().offset).toEqual({ x: PAN_STEP, y: -PAGE_PAN_STEP });

    panBy({ x: -FAST_PAN_STEP, y: FAST_PAN_STEP });
    expect(useViewportStore.getState().offset).toEqual({
      x: PAN_STEP - FAST_PAN_STEP,
      y: -PAGE_PAN_STEP + FAST_PAN_STEP,
    });
  });

  it('sets the offset directly with setOffset', () => {
    const { setOffset } = useViewportStore.getState();

    setOffset({ x: 250, y: -400 });
    expect(useViewportStore.getState().offset).toEqual({ x: 250, y: -400 });
  });

  it('resets the offset to (0, 0) with resetOffset', () => {
    const { panBy, resetOffset } = useViewportStore.getState();

    panBy({ x: 500, y: 300 });
    expect(useViewportStore.getState().offset).toEqual({ x: 500, y: 300 });

    resetOffset();
    expect(useViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
  });

  describe('panToExtent', () => {
    it('resets to (0, 0) when no towers exist', () => {
      const { setOffset, panToExtent } = useViewportStore.getState();

      setOffset({ x: 300, y: 300 });
      panToExtent({});
      expect(useViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
    });

    it('pans to encompass active towers', () => {
      const { panToExtent } = useViewportStore.getState();

      const towers: Record<string, TowerState> = {
        t1: {
          id: 't1',
          position: { x: 100, y: 50 },
          root: makeEmptyStatement('b1', 0, false),
        },
        t2: {
          id: 't2',
          position: { x: 600, y: 450 },
          root: makeEmptyStatement('b2', 0, false),
        },
      };

      panToExtent(towers);
      expect(useViewportStore.getState().offset).toEqual({
        x: -600 + 100,
        y: -450 + 100,
      });
    });
  });
});
