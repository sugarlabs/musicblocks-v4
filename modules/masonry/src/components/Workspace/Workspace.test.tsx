// Component smoke test for the Workspace's palette drag wiring. Renders into jsdom via React
// Testing Library. interact.js pointer choreography (real pointerdown/move/up sequences) is not
// reproducible reliably under jsdom, so drag start/move/end behavior itself is covered by the
// pure-function tests in useDragFromPalette.test.tsx and exercised manually via the playground;
// this file verifies the pieces mount and react to the drag store correctly.

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { PaletteConfig } from '@/@types/palette.types';
import type { TowerStatementNode } from '@/@types/tower.types';
import type { TowerState } from '@/@types/workspace.types';

import { makeEmptyStatement } from '@/mocks/tower';
import { useBrickLayoutStore } from '@/stores/brick';
import { usePaletteDragStore } from '@/stores/palette';
import { useTrashStore } from '@/stores/trash';
import { useWorkspaceStore } from '@/stores/workspace';
import { createBrickModel, wrapAsRootNode } from '@/utils/brick-model-factory';
import { FOLD_TOGGLE_SELECTOR } from '@/utils/constants';

import { Workspace } from './Workspace';

afterEach(() => {
  cleanup();
  usePaletteDragStore.setState({ dragged: null });
  useWorkspaceStore.setState({ towers: {} });
  useTrashStore.setState({ bounds: null, isHovered: false });
  useBrickLayoutStore.setState({ coords: {}, mounted: {}, positioned: {} });
});

// -------------------------------------------------------------------------------------------------
// Fixtures
// -------------------------------------------------------------------------------------------------

/** Deterministic stub for the icon component slot. */
const StubIcon = (props: { className?: string; style?: React.CSSProperties }) => (
  <span data-testid="stub-icon" {...props} />
);

const paletteConfig: PaletteConfig = {
  classifications: [
    {
      name: 'Music',
      icon: StubIcon,
      categories: [
        {
          name: 'Rhythm',
          icon: StubIcon,
          color: '#123456',
          bricks: [
            {
              id: 'r1',
              name: 'Note',
              description: 'play a note',
              brick: {
                kind: 'statement',
                widget: { type: 'label', text: 'Note' },
                colorsDefault: {
                  background: '#e07a5f',
                  foreground: '#ffffff',
                  border: '#00000033',
                },
                tooltipText: 'play a note',
              },
            },
          ],
        },
      ],
    },
  ],
};

/** Builds a one-brick tower the same way a palette drop does, so the canvas holds something. */
function makeTower(id: string): TowerState {
  const entry = paletteConfig.classifications[0].categories[0].bricks[0];

  return { id, root: wrapAsRootNode(createBrickModel(entry.brick)), position: { x: 0, y: 0 } };
}

/**
 * A two-brick tower whose cavity holds the second brick, so a fold has something to hide.
 *
 * Both bricks are marked mounted up front: `TowerBrick` renders nothing until they are, and the
 * point of the fold test is what the canvas lists, not when the layout pass gets to it.
 */
function makeNestingTower(id: string, folded = false): TowerState {
  const outer = makeEmptyStatement(`${id}-outer`, 0, true);
  const inner = makeEmptyStatement(`${id}-inner`, 0, false);

  outer.nestedNext = inner;
  inner.prev = outer;
  outer.model.isNestingFolded = folded;

  useBrickLayoutStore.getState().setMounted({ [outer.model.id]: true, [inner.model.id]: true });

  return { id, root: outer, position: { x: 0, y: 0 } };
}

/** The ids of the bricks the canvas has actually put in the DOM. */
function renderedBrickIds(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-id]')).map(
    (el) => el.dataset.id,
  );
}

/** The fold toggle on the named brick, or null when that brick has none. */
function foldToggleOf(container: HTMLElement, brickId: string) {
  return container.querySelector<HTMLButtonElement>(
    `[data-id="${brickId}"] ${FOLD_TOGGLE_SELECTOR}`,
  );
}

/** The Trash's positioning node, or null while it is off the canvas. */
function queryTrash(container: HTMLElement) {
  return container.querySelector<HTMLElement>('[data-testid="workspace-trash"]');
}

// -------------------------------------------------------------------------------------------------

describe('Workspace', () => {
  it('renders the palette with drag-source slots and binds the drag hook without crashing', () => {
    const { container } = render(<Workspace config={{ palette: paletteConfig }} />);

    // The palette slot carries the delegated drag-source markup the hook binds against.
    const slot = container.querySelector('.palette-brick-slot');
    expect(slot).not.toBeNull();
    expect(slot?.getAttribute('data-brick-id')).toBe('r1');
  });

  it('keeps the drag ghost mounted but hidden and empty while no drag is active', () => {
    const { container } = render(<Workspace config={{ palette: paletteConfig }} />);

    const ghost = container.querySelector('.pointer-events-none.absolute.z-50');
    expect(ghost).not.toBeNull();
    // Hidden until the drag hook reveals it, and empty until the store carries a payload.
    expect((ghost as HTMLElement).style.display).toBe('none');
    expect(ghost?.childElementCount).toBe(0);
  });

  it('mounts a brick preview inside the ghost while the drag store holds a payload', () => {
    const { container } = render(<Workspace config={{ palette: paletteConfig }} />);
    const entry = paletteConfig.classifications[0].categories[0].bricks[0];

    act(() => {
      usePaletteDragStore.getState().startDrag(entry);
    });

    const ghost = container.querySelector('.pointer-events-none.absolute.z-50');
    expect(ghost?.childElementCount).toBeGreaterThan(0);

    act(() => {
      usePaletteDragStore.getState().endDrag();
    });

    expect(ghost?.childElementCount).toBe(0);
  });

  it('clears the active drag from the store when the Workspace unmounts mid-drag', () => {
    const { unmount } = render(<Workspace config={{ palette: paletteConfig }} />);
    const entry = paletteConfig.classifications[0].categories[0].bricks[0];

    // Simulate a drag left in flight: interact's `end` listener never fires once the Workspace
    // is gone, so the hook's effect cleanup must clear the (module-global) store itself.
    act(() => {
      usePaletteDragStore.getState().startDrag(entry);
    });

    unmount();

    expect(usePaletteDragStore.getState().dragged).toBeNull();
  });

  describe('trash', () => {
    it('keeps the trash off an empty canvas, since there is nothing to remove yet', () => {
      const { container } = render(<Workspace config={{ palette: paletteConfig }} />);

      expect(queryTrash(container)).toBeNull();
    });

    it('renders the trash as soon as the workspace holds a tower', () => {
      const { container } = render(<Workspace config={{ palette: paletteConfig }} />);

      act(() => {
        useWorkspaceStore.getState().createTower(makeTower('t1'));
      });

      expect(queryTrash(container)).not.toBeNull();
    });

    it('publishes its bounds while mounted and drops them once the canvas empties', () => {
      const { container } = render(<Workspace config={{ palette: paletteConfig }} />);

      act(() => {
        useWorkspaceStore.getState().createTower(makeTower('t1'));
      });

      // jsdom reports a zero rect, so only the shape is asserted — the numbers come from layout.
      expect(useTrashStore.getState().bounds).toEqual({
        x: expect.any(Number),
        y: expect.any(Number),
        w: expect.any(Number),
        h: expect.any(Number),
      });

      act(() => {
        useWorkspaceStore.getState().removeTower('t1');
      });

      expect(queryTrash(container)).toBeNull();
      expect(useTrashStore.getState().bounds).toBeNull();
    });

    it('keeps the trash while any tower remains and removes it with the last one', () => {
      const { container } = render(<Workspace config={{ palette: paletteConfig }} />);

      act(() => {
        useWorkspaceStore.getState().createTower(makeTower('t1'));
        useWorkspaceStore.getState().createTower(makeTower('t2'));
      });

      act(() => {
        useWorkspaceStore.getState().removeTower('t1');
      });
      expect(queryTrash(container)).not.toBeNull();

      act(() => {
        useWorkspaceStore.getState().removeTower('t2');
      });
      expect(queryTrash(container)).toBeNull();
    });

    it('swaps to its destructive styling while the drag store reports a hover', () => {
      const { container } = render(<Workspace config={{ palette: paletteConfig }} />);

      act(() => {
        useWorkspaceStore.getState().createTower(makeTower('t1'));
      });

      const trash = queryTrash(container) as HTMLElement;
      expect(trash.classList.contains('border-border')).toBe(true);
      expect(trash.classList.contains('border-destructive')).toBe(false);

      act(() => {
        useTrashStore.getState().setHovered(true);
      });

      expect(trash.classList.contains('border-destructive')).toBe(true);
      expect(trash.classList.contains('text-destructive')).toBe(true);
      expect(trash.classList.contains('border-border')).toBe(false);

      act(() => {
        useTrashStore.getState().setHovered(false);
      });

      expect(trash.classList.contains('border-border')).toBe(true);
      expect(trash.classList.contains('border-destructive')).toBe(false);
    });

    it('stays transparent to pointer events so it never swallows the drag of a brick beneath it', () => {
      const { container } = render(<Workspace config={{ palette: paletteConfig }} />);

      act(() => {
        useWorkspaceStore.getState().createTower(makeTower('t1'));
      });

      expect(queryTrash(container)?.classList.contains('pointer-events-none')).toBe(true);
    });
  });

  describe('folded bricks', () => {
    it('renders both bricks of a nesting tower while the cavity is open', () => {
      const tower = makeNestingTower('t1');

      const { container } = render(<Workspace config={{ palette: paletteConfig }} />);
      act(() => {
        useWorkspaceStore.getState().createTower(tower);
      });

      expect(renderedBrickIds(container)).toEqual(expect.arrayContaining(['t1-outer', 't1-inner']));
    });

    it('leaves the brick inside a folded cavity out of the canvas', () => {
      const tower = makeNestingTower('t1', true);

      const { container } = render(<Workspace config={{ palette: paletteConfig }} />);
      act(() => {
        useWorkspaceStore.getState().createTower(tower);
      });

      // The brick is mounted and still in the graph; the fold is the only reason it is not drawn.
      const ids = renderedBrickIds(container);
      expect(ids).toContain('t1-outer');
      expect(ids).not.toContain('t1-inner');
    });

    it('takes the cavity off the canvas and gives it back as the fold is toggled', () => {
      const tower = makeNestingTower('t1');

      const { container } = render(<Workspace config={{ palette: paletteConfig }} />);
      act(() => {
        useWorkspaceStore.getState().createTower(tower);
      });

      act(() => {
        useWorkspaceStore.getState().setNestingFold('t1-outer', true);
      });

      // Re-seating the tower is what the canvas listens to, so the fold reaches the DOM without
      // waiting on the layout pass it also starts.
      expect(renderedBrickIds(container)).not.toContain('t1-inner');

      act(() => {
        useWorkspaceStore.getState().setNestingFold('t1-outer', false);
      });

      expect(renderedBrickIds(container)).toContain('t1-inner');
    });

    it('folds the cavity from the chevron on the brick itself', () => {
      const tower = makeNestingTower('t1');

      const { container } = render(<Workspace config={{ palette: paletteConfig }} />);
      act(() => {
        useWorkspaceStore.getState().createTower(tower);
      });

      act(() => {
        foldToggleOf(container, 't1-outer')!.click();
      });

      expect((tower.root as TowerStatementNode).model.isNestingFolded).toBe(true);
      expect(renderedBrickIds(container)).not.toContain('t1-inner');
    });

    it('leaves the tower where it is when the chevron is pressed', () => {
      const tower = makeNestingTower('t1');
      tower.position = { x: 140, y: 60 };

      const { container } = render(<Workspace config={{ palette: paletteConfig }} />);
      act(() => {
        useWorkspaceStore.getState().createTower(tower);
      });

      act(() => {
        const toggle = foldToggleOf(container, 't1-outer')!;
        // The press, not just the click: interact.js starts a brick drag off a pointerdown, and the
        // toggle is overlaid on the brick, so this is the event the fold has to keep to itself.
        fireEvent.pointerDown(toggle);
        toggle.click();
      });

      expect(useWorkspaceStore.getState().towers['t1'].position).toEqual({ x: 140, y: 60 });
    });

    it('disables the chevron on a nesting brick with nothing in its cavity', () => {
      const outer = makeEmptyStatement('t1-outer', 0, true);
      useBrickLayoutStore.getState().setMounted({ 't1-outer': true });

      const { container } = render(<Workspace config={{ palette: paletteConfig }} />);
      act(() => {
        useWorkspaceStore
          .getState()
          .createTower({ id: 't1', root: outer, position: { x: 0, y: 0 } });
      });

      expect(foldToggleOf(container, 't1-outer')!.disabled).toBe(true);
    });
  });
});
