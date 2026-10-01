// Component test for the Workspace's HomeControl button.
// Verifies it is disabled until the view is panned or a tower leaves the canvas, and that it brings
// the view back and lays every tower out inside the canvas.

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Bounds, Point } from '@/@types/common.types';
import type { TowerStatementNode } from '@/@types/tower.types';
import { makeEmptyStatement } from '@/mocks/tower';
import { useWorkspaceHistoryStore } from '@/stores/history';
import { useWorkspaceViewportStore } from '@/stores/viewport';
import { useWorkspaceStore } from '@/stores/workspace';
import { resolveStatementConnection } from '@/utils/statement-connect';
import { traverseTopDown } from '@/utils/tower-traversal';

import { HomeControl } from './HomeControl';

afterEach(async () => {
  cleanup();
  // Lets the history commit of a Home click land before the history is cleared.
  await import('@/stores/history');
  useWorkspaceViewportStore.setState({ offset: { x: 0, y: 0 } });
  useWorkspaceStore.getState().statementCollisionSpace.reset();
  useWorkspaceStore.setState({ towers: {}, statementConnectors: {} });
  useWorkspaceHistoryStore.setState({ history: [], currentIndex: -1 });
});

/** The home button; always rendered, so a missing one fails the test outright. */
function homeButton() {
  return screen.getByRole('button', { name: 'Home' }) as HTMLButtonElement;
}

/** Renders the control over a canvas, 1000 by 600 unless given another size. */
function renderInCanvas(width = 1000, height = 600) {
  const canvas = document.createElement('div');
  canvas.getBoundingClientRect = () => ({ width, height }) as DOMRect;
  render(<HomeControl canvasRef={{ current: canvas }} />);
}

/** Puts a tower at `position`, with its bricks laid out and its connection points synced. */
function placeTower(id: string, position: Point, root = makeEmptyStatement(`${id}-brick`, 0)) {
  root.model.computeDims();
  traverseTopDown(root, position);
  useWorkspaceStore.getState().createTower({ id, root, position });
  useWorkspaceStore.getState().syncStatementConnectors(id, root);

  return root;
}

/** Where a tower sits and the room its brick takes. */
function towerBox(id: string): Bounds {
  const { root, position } = useWorkspaceStore.getState().towers[id];

  return { ...position, ...root.model.dims };
}

/** Moves a tower the way a drag does. */
function dragTower(id: string, position: Point) {
  act(() => useWorkspaceStore.getState().updateTowerPosition(id, position));
}

describe('HomeControl', () => {
  it('renders the home button disabled while the canvas sits at the origin', () => {
    render(<HomeControl />);

    expect(homeButton().disabled).toBe(true);
  });

  it('enables as soon as a pan moves the canvas off the origin', () => {
    render(<HomeControl />);

    // One axis is enough: a canvas panned straight sideways is not at the origin.
    act(() => {
      useWorkspaceViewportStore.getState().panBy({ x: 40, y: 0 });
    });

    expect(homeButton().disabled).toBe(false);
  });

  it('stays disabled when a pan is clamped away at the origin', () => {
    render(<HomeControl />);

    // The store stops the offset at the origin, so a pan back past it changes nothing and there is
    // still nowhere to return from.
    act(() => {
      useWorkspaceViewportStore.getState().panBy({ x: -40, y: -40 });
    });

    expect(homeButton().disabled).toBe(true);
  });

  it('returns the canvas to the origin and disables again when clicked', () => {
    useWorkspaceViewportStore.setState({ offset: { x: 240, y: 80 } });
    render(<HomeControl />);

    fireEvent.click(homeButton());

    expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
    expect(homeButton().disabled).toBe(true);
  });
});

describe('HomeControl over a canvas', () => {
  it('stays disabled while every tower is on screen, and enables once one is not', () => {
    placeTower('tower-1', { x: 100, y: 100 });
    renderInCanvas();
    expect(homeButton().disabled).toBe(true);

    dragTower('tower-1', { x: 980, y: 100 });

    expect(homeButton().disabled).toBe(false);
  });

  it('brings a tower dragged off screen back inside the canvas', () => {
    placeTower('tower-1', { x: 100, y: 100 });
    renderInCanvas();

    dragTower('tower-1', { x: -400, y: 900 });
    fireEvent.click(homeButton());

    const box = towerBox('tower-1');
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.w).toBeLessThanOrEqual(1000);
    expect(box.y + box.h).toBeLessThanOrEqual(600);
    expect(homeButton().disabled).toBe(true);
  });

  it('turns off after Home even when a tower is too tall to fit the canvas', () => {
    const tall = makeEmptyStatement('tall-brick', 0);
    tall.model.widgetDims = { w: 100, h: 800 };
    placeTower('tall', { x: 300, y: 100 }, tall);
    renderInCanvas();
    expect(homeButton().disabled).toBe(false);

    fireEvent.click(homeButton());

    expect(homeButton().disabled).toBe(true);
  });

  it('keeps towers at real positions on a canvas narrower than the layout margin', () => {
    // A phone, where the palette leaves only a sliver of canvas.
    placeTower('tower-1', { x: 100, y: 100 });
    renderInCanvas(60);

    fireEvent.click(homeButton());

    const { x, y } = towerBox('tower-1');
    expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true);
  });

  it('keeps a tower added from the palette, with the same bricks', () => {
    placeTower('tower-1', { x: 100, y: 100 });
    renderInCanvas();

    // Added after load and dropped off screen, the way a palette drop can be.
    let added: TowerStatementNode;
    act(() => {
      added = placeTower('tower-2', { x: 1200, y: 300 });
    });
    fireEvent.click(homeButton());

    const { towers } = useWorkspaceStore.getState();
    expect(Object.keys(towers).sort()).toEqual(['tower-1', 'tower-2']);
    expect(towers['tower-2'].root).toBe(added!);
  });

  it('fits a big tower and a pile of bricks on screen, without any two overlapping', () => {
    // A program-sized tower, and 18 bricks dropped all over, some hanging off the edges.
    const big = makeEmptyStatement('big-brick', 0);
    big.model.widgetDims = { w: 360, h: 300 };
    placeTower('big', { x: 700, y: 400 }, big);
    const ids = ['big', ...Array.from({ length: 18 }, (_, i) => `brick-${i}`)];
    ids
      .slice(1)
      .forEach((id, i) => placeTower(id, { x: ((i * 97) % 1100) - 50, y: (i * 61) % 700 }));
    renderInCanvas();

    fireEvent.click(homeButton());

    const boxes = ids.map(towerBox);
    boxes.forEach((a, i) => {
      // Inside the 1000 by 600 canvas.
      expect(a.x).toBeGreaterThanOrEqual(0);
      expect(a.y).toBeGreaterThanOrEqual(0);
      expect(a.x + a.w).toBeLessThanOrEqual(1000);
      expect(a.y + a.h).toBeLessThanOrEqual(600);

      for (const b of boxes.slice(i + 1)) {
        const overlaps = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
        expect(overlaps).toBe(false);
      }
    });
    // Everything is on screen now, so there is nothing left for Home to do.
    expect(homeButton().disabled).toBe(true);
  });

  it('moves the connection points with the towers, so a brick still snaps on after Home', () => {
    const host = placeTower('tower-1', { x: 1500, y: 900 });
    renderInCanvas();

    fireEvent.click(homeButton());

    // Dropped with its top groove on the host's bottom tab, where the host is now.
    const dropped = makeEmptyStatement('dropped', 0);
    const at = useWorkspaceStore.getState().towers['tower-1'].position;
    const next = host.model.getConnectorCoords().next!;
    const prev = dropped.model.getConnectorCoords().prev!;
    act(() => {
      placeTower('tower-2', { x: at.x + next.x - prev.x, y: at.y + next.y - prev.y }, dropped);
    });

    const store = useWorkspaceStore.getState();
    const connection = resolveStatementConnection({
      draggedTowerId: 'tower-2',
      space: store.statementCollisionSpace,
      connectors: store.statementConnectors,
      towers: store.towers,
    });
    expect(connection).toMatchObject({ parent: host, child: dropped, hostTowerId: 'tower-1' });
  });

  it('puts every tower back where it was with one undo', async () => {
    placeTower('tower-1', { x: 1500, y: 100 });
    placeTower('tower-2', { x: -300, y: 200 });
    useWorkspaceHistoryStore.getState().init();
    renderInCanvas();

    fireEvent.click(homeButton());
    await vi.waitFor(() => expect(useWorkspaceHistoryStore.getState().history).toHaveLength(2));
    act(() => useWorkspaceHistoryStore.getState().undo());

    const { towers } = useWorkspaceStore.getState();
    expect(towers['tower-1'].position).toEqual({ x: 1500, y: 100 });
    expect(towers['tower-2'].position).toEqual({ x: -300, y: 200 });
  });
});
