import { act, cleanup, render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useWorkspaceScaleStore } from '@/stores/scale';
import { useWorkspaceViewportStore } from '@/stores/viewport';
import { DEFAULT_SCALE_LEVEL } from '@/utils/constants';
import { calculateGridSpacing, generateGridBackgroundImage } from '@/utils/workspace-grid';
import { useCanvasGrid } from './useCanvasGrid';

function TestGridCanvas({ visible = true }: { visible?: boolean }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  useCanvasGrid({ canvasRef, visible });

  return (
    <div ref={canvasRef} data-testid="test-canvas">
      <div data-testid="child-element">Child</div>
    </div>
  );
}

describe('useCanvasGrid', () => {
  beforeEach(() => {
    useWorkspaceScaleStore.setState({ level: DEFAULT_SCALE_LEVEL });
    useWorkspaceViewportStore.setState({ offset: { x: 0, y: 0 } });
  });

  afterEach(() => {
    cleanup();
    useWorkspaceScaleStore.setState({ level: DEFAULT_SCALE_LEVEL });
    useWorkspaceViewportStore.setState({ offset: { x: 0, y: 0 } });
  });

  it('does nothing when canvasRef is null', () => {
    const NullCanvas = () => {
      const ref = useRef<HTMLDivElement>(null);
      useCanvasGrid({ canvasRef: ref });
      return null;
    };
    expect(() => render(<NullCanvas />)).not.toThrow();
  });

  it('applies grid CSS background to the existing canvas element on mount', () => {
    const { getByTestId } = render(<TestGridCanvas />);
    const canvas = getByTestId('test-canvas');

    const expectedSpacing = calculateGridSpacing(DEFAULT_SCALE_LEVEL);
    expect(canvas.style.backgroundImage).toBe(generateGridBackgroundImage(expectedSpacing));
    expect(canvas.style.backgroundPosition).toBe('0px 0px');
  });

  it('does NOT create any overlay element or extra DOM nodes', () => {
    const { getByTestId } = render(<TestGridCanvas />);
    const canvas = getByTestId('test-canvas');

    // Only the pre-existing child element should be in the canvas
    expect(canvas.children.length).toBe(1);
    expect(canvas.firstElementChild?.getAttribute('data-testid')).toBe('child-element');
  });

  it('initial scale produces the correct gradient', () => {
    useWorkspaceScaleStore.setState({ level: 1 });
    const { getByTestId } = render(<TestGridCanvas />);
    const canvas = getByTestId('test-canvas');

    const expectedSpacing = calculateGridSpacing(1);
    expect(canvas.style.backgroundImage).toBe(generateGridBackgroundImage(expectedSpacing));
  });

  it('updates background gradient when workspace scale level changes', () => {
    const { getByTestId } = render(<TestGridCanvas />);
    const canvas = getByTestId('test-canvas');

    const level2Spacing = calculateGridSpacing(2);
    expect(canvas.style.backgroundImage).toBe(generateGridBackgroundImage(level2Spacing));

    act(() => {
      useWorkspaceScaleStore.getState().zoomIn();
    });

    const level3Spacing = calculateGridSpacing(3);
    expect(canvas.style.backgroundImage).toBe(generateGridBackgroundImage(level3Spacing));

    act(() => {
      useWorkspaceScaleStore.getState().setLevel(1);
    });

    const level1Spacing = calculateGridSpacing(1);
    expect(canvas.style.backgroundImage).toBe(generateGridBackgroundImage(level1Spacing));
  });

  it('updates background-position when viewport offset changes', () => {
    const { getByTestId } = render(<TestGridCanvas />);
    const canvas = getByTestId('test-canvas');

    expect(canvas.style.backgroundPosition).toBe('0px 0px');

    act(() => {
      useWorkspaceViewportStore.getState().setOffset({ x: 40, y: 10 });
    });

    expect(canvas.style.backgroundPosition).toBe('40px 10px');

    act(() => {
      useWorkspaceViewportStore.getState().panBy({ x: 20, y: 30 });
    });

    expect(canvas.style.backgroundPosition).toBe('60px 40px');
  });

  it('clears grid background when visible is false', () => {
    const { getByTestId, rerender } = render(<TestGridCanvas visible={true} />);
    const canvas = getByTestId('test-canvas');

    expect(canvas.style.backgroundImage).toBeTruthy();
    expect(canvas.style.backgroundPosition).toBe('0px 0px');

    rerender(<TestGridCanvas visible={false} />);

    expect(canvas.style.backgroundImage).toBe('');
    expect(canvas.style.backgroundPosition).toBe('');
  });

  it('restores grid background when visible toggles from false to true', () => {
    const { getByTestId, rerender } = render(<TestGridCanvas visible={false} />);
    const canvas = getByTestId('test-canvas');

    expect(canvas.style.backgroundImage).toBe('');

    rerender(<TestGridCanvas visible={true} />);

    const expectedSpacing = calculateGridSpacing(DEFAULT_SCALE_LEVEL);
    expect(canvas.style.backgroundImage).toBe(generateGridBackgroundImage(expectedSpacing));
    expect(canvas.style.backgroundPosition).toBe('0px 0px');
  });

  it('cleans up store subscriptions and clears style on unmount', () => {
    const { getByTestId, unmount } = render(<TestGridCanvas />);
    const canvas = getByTestId('test-canvas');

    expect(canvas.style.backgroundImage).toBeTruthy();

    unmount();

    // Style is cleared on cleanup
    expect(canvas.style.backgroundImage).toBe('');
    expect(canvas.style.backgroundPosition).toBe('');

    // Further store changes do not throw or affect unmounted node
    act(() => {
      useWorkspaceViewportStore.getState().setOffset({ x: 100, y: 100 });
      useWorkspaceScaleStore.getState().zoomIn();
    });
    expect(canvas.style.backgroundImage).toBe('');
expect(canvas.style.backgroundPosition).toBe('');
  });
});
