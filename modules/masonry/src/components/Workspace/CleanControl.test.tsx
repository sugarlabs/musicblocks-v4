// Component test for the Workspace's CleanControl button.
// Verifies button rendering, the disabled state off the workspace store, that a click tidies the
// towers with the canvas height it is handed, and that it brings a panned canvas back home.

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { RefObject } from 'react';

import type { Point } from '@/@types/common.types';

import { makeEmptyStatement } from '@/mocks/tower';
import { useBrickLayoutStore } from '@/stores/brick';
import { useWorkspaceViewportStore } from '@/stores/viewport';
import { useWorkspaceStore } from '@/stores/workspace';
import { CLEAN_WORKSPACE_GAP, CLEAN_WORKSPACE_PADDING } from '@/utils/constants';

import { CleanControl } from './CleanControl';

afterEach(() => {
  cleanup();
  useWorkspaceStore.setState({ towers: {}, statementConnectors: {}, argumentConnectors: {} });
  useBrickLayoutStore.setState({ coords: {}, mounted: {}, positioned: {} });
  useWorkspaceViewportStore.setState({ offset: { x: 0, y: 0 } });
});

/** A canvas stand-in reporting `clientHeight`, which jsdom would otherwise leave at zero. */
function canvasOfHeight(clientHeight: number): RefObject<HTMLElement | null> {
  const canvas = document.createElement('div');
  Object.defineProperty(canvas, 'clientHeight', { value: clientHeight });
  return { current: canvas };
}

/** A one-brick tower whose root has real dims, so the tidy has something to measure. */
function addTower(id: string, position: Point) {
  const root = makeEmptyStatement(id, 0);
  root.model.widgetDims = { w: 40, h: 14 };
  root.model.computeDims();
  useWorkspaceStore.getState().createTower({ id, root, position });
  return root;
}

function cleanButton() {
  return screen.getByRole('button', { name: 'Clean workspace' }) as HTMLButtonElement;
}

describe('CleanControl', () => {
  it('renders the clean button with its accessibility label', () => {
    render(<CleanControl canvasRef={{ current: null }} />);

    expect(cleanButton()).toBeTruthy();
  });

  it('is disabled while the workspace holds no tower', () => {
    render(<CleanControl canvasRef={{ current: null }} />);

    expect(cleanButton().disabled).toBe(true);
  });

  it('enables once the workspace holds a tower', () => {
    render(<CleanControl canvasRef={{ current: null }} />);

    act(() => {
      addTower('t1', { x: 300, y: 200 });
    });

    expect(cleanButton().disabled).toBe(false);
  });

  it('tidies the towers into a column when clicked', () => {
    addTower('t1', { x: 500, y: 300 });
    addTower('t2', { x: 100, y: 40 });
    render(<CleanControl canvasRef={{ current: null }} />);

    fireEvent.click(cleanButton());

    const { towers } = useWorkspaceStore.getState();
    expect(towers['t2'].position).toEqual({
      x: CLEAN_WORKSPACE_PADDING,
      y: CLEAN_WORKSPACE_PADDING,
    });
    expect(towers['t1'].position.x).toBe(CLEAN_WORKSPACE_PADDING);
    expect(towers['t1'].position.y).toBeGreaterThan(CLEAN_WORKSPACE_PADDING);
  });

  it('wraps the column at the height of the canvas it is given', () => {
    const first = addTower('t1', { x: 0, y: 0 });
    addTower('t2', { x: 0, y: 100 });
    // Room for one tower and no more, so the second one has to start a column of its own.
    const { w, h } = first.model.dims;
    render(<CleanControl canvasRef={canvasOfHeight(CLEAN_WORKSPACE_PADDING * 2 + h)} />);

    fireEvent.click(cleanButton());

    expect(useWorkspaceStore.getState().towers['t2'].position).toEqual({
      x: CLEAN_WORKSPACE_PADDING + w + CLEAN_WORKSPACE_GAP,
      y: CLEAN_WORKSPACE_PADDING,
    });
  });

  // cleanWorkspace works in canvas coordinates, so on a panned canvas the tidied column would land
  // outside the view. The button brings the canvas home first.
  it('returns a panned canvas to the origin before tidying', () => {
    addTower('t1', { x: 500, y: 300 });
    useWorkspaceViewportStore.getState().setOffset({ x: 260, y: 140 });
    render(<CleanControl canvasRef={{ current: null }} />);

    fireEvent.click(cleanButton());

    expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
    expect(useWorkspaceStore.getState().towers['t1'].position).toEqual({
      x: CLEAN_WORKSPACE_PADDING,
      y: CLEAN_WORKSPACE_PADDING,
    });
  });
});
