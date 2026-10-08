// Tests for the drag-to-click suppression shared by the palette slot, a workspace brick and a
// canvas pan. The hook reads the clock at press time, so only Date is faked and stepped through
// deterministically. The file is .tsx so it runs in the dom project: the callbacks' identity
// across rerenders is part of the contract, so the hook is exercised through `renderHook`.

import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DRAG_CLICK_SUPPRESSION_MS } from '@/utils/constants';

import { isTrailingDragClick, useDragClickSuppression } from './useDragClickSuppression';

// -------------------------------------------------------------------------------------------------

const T0 = new Date('2026-01-01T00:00:00Z').getTime();

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(T0);
});

afterEach(() => {
  vi.useRealTimers();
});

// -------------------------------------------------------------------------------------------------

describe('isTrailingDragClick', () => {
  it('reports a click trailing a drag that ended inside the window', () => {
    expect(isTrailingDragClick(T0)).toBe(true);
  });

  it('reports a click a hair under the window as trailing', () => {
    vi.setSystemTime(T0 + DRAG_CLICK_SUPPRESSION_MS - 1);

    expect(isTrailingDragClick(T0)).toBe(true);
  });

  it('stops reporting a click once the window has fully elapsed', () => {
    vi.setSystemTime(T0 + DRAG_CLICK_SUPPRESSION_MS);

    expect(isTrailingDragClick(T0)).toBe(false);
  });
});

describe('useDragClickSuppression', () => {
  it('reports no suppression before any drag has ended', () => {
    const { result } = renderHook(() => useDragClickSuppression());

    expect(result.current.shouldSuppressClick()).toBe(false);
  });

  it('reports suppression right after a drag ends', () => {
    const { result } = renderHook(() => useDragClickSuppression());

    result.current.markDragEnd();

    expect(result.current.shouldSuppressClick()).toBe(true);
  });

  it('stops reporting suppression once the window has elapsed', () => {
    const { result } = renderHook(() => useDragClickSuppression());

    result.current.markDragEnd();
    vi.setSystemTime(T0 + DRAG_CLICK_SUPPRESSION_MS);

    expect(result.current.shouldSuppressClick()).toBe(false);
  });

  it('keeps both callbacks stable across rerenders', () => {
    const { result, rerender } = renderHook(() => useDragClickSuppression());
    const { markDragEnd, shouldSuppressClick } = result.current;

    rerender();

    expect(result.current.markDragEnd).toBe(markDragEnd);
    expect(result.current.shouldSuppressClick).toBe(shouldSuppressClick);
  });
});
