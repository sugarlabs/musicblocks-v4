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

import { makeEmptyStatement, makeEmptyValue } from '@/mocks/tower';
import { useBrickLayoutStore } from '@/stores/brick';
import { useConnectionPreviewStore } from '@/stores/connection-preview';
import { usePaletteDragStore } from '@/stores/palette';
import { useTrashStore } from '@/stores/trash';
import { useWorkspaceViewportStore } from '@/stores/viewport';
import { useWorkspaceStore } from '@/stores/workspace';
import { createBrickModel, wrapAsRootNode } from '@/utils/brick-model-factory';
import { FOLD_TOGGLE_SELECTOR } from '@/utils/constants';

import { Workspace } from './Workspace';

afterEach(() => {
  cleanup();
  usePaletteDragStore.setState({ dragged: null });
  useWorkspaceStore.setState({ towers: {}, selectedBrickId: null });
  useTrashStore.setState({ bounds: null, isHovered: false });
  useBrickLayoutStore.setState({ coords: {}, mounted: {}, positioned: {} });
  useWorkspaceViewportStore.setState({ offset: { x: 0, y: 0 } });
  useConnectionPreviewStore.setState({ activeTarget: null, isValid: false, snapPosition: null });
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

/**
 * A one-brick tower whose single argument slot holds a numberbox value brick, so the canvas has a
 * real `<input>` for the typing guard to be tested against.
 */
function makeTowerWithInput(id: string): TowerState {
  const root = makeEmptyStatement(`${id}-root`, 1);
  const value = makeEmptyValue(`${id}-value`);

  root.args[0] = value;
  value.parent = root;

  useBrickLayoutStore.getState().setMounted({ [root.model.id]: true, [value.model.id]: true });

  return { id, root, position: { x: 0, y: 0 } };
}

/** The wrapper a brick's highlight rides on, inside the element that seats it in the tower. */
function highlightLayerOf(container: HTMLElement, brickId: string) {
  return container.querySelector<HTMLElement>(`[data-id="${brickId}"]`)
    ?.firstElementChild as HTMLElement;
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

/** The node a pan moves, holding everything drawn in canvas coordinates. */
function queryViewport(container: HTMLElement) {
  return container.querySelector<HTMLElement>('[data-testid="workspace-viewport"]');
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

  it('selects a brick, clears it from the background, and clears it with Escape', () => {
    const { container } = render(<Workspace config={{ palette: paletteConfig }} />);
    const tower = makeNestingTower('selection');

    act(() => {
      useWorkspaceStore.getState().createTower(tower);
    });

    const canvas = container.querySelector('[data-testid="workspace-canvas"]') as HTMLElement;
    const brick = container.querySelector('[data-id="selection-outer"]') as HTMLElement;

    fireEvent.click(brick);
    expect(useWorkspaceStore.getState().selectedBrickId).toBe('selection-outer');

    fireEvent.click(canvas);
    expect(useWorkspaceStore.getState().selectedBrickId).toBeNull();

    fireEvent.click(brick);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(useWorkspaceStore.getState().selectedBrickId).toBeNull();
  });

  it('deletes a selected root and extracts then discards a selected nested brick', () => {
    const { container } = render(<Workspace config={{ palette: paletteConfig }} />);
    const tower = makeNestingTower('keyboard');

    act(() => {
      useWorkspaceStore.getState().createTower(tower);
    });

    const root = container.querySelector('[data-id="keyboard-outer"]') as HTMLElement;
    fireEvent.click(root);
    fireEvent.keyDown(window, { key: 'Delete' });
    expect(useWorkspaceStore.getState().towers).toEqual({});

    const secondTower = makeNestingTower('keyboard-nested');
    act(() => {
      useWorkspaceStore.getState().createTower(secondTower);
    });

    const nested = container.querySelector('[data-id="keyboard-nested-inner"]') as HTMLElement;
    fireEvent.click(nested);
    fireEvent.keyDown(window, { key: 'Backspace' });

    const remaining = useWorkspaceStore.getState().towers['keyboard-nested'];
    expect(remaining).toBeDefined();
    expect((remaining?.root as TowerStatementNode).nestedNext).toBeNull();
    expect(Object.keys(useWorkspaceStore.getState().towers)).toEqual(['keyboard-nested']);
  });

  it('leaves the selection alone while the user types in a brick input', () => {
    const { container } = render(<Workspace config={{ palette: paletteConfig }} />);

    act(() => {
      useWorkspaceStore.getState().createTower(makeTowerWithInput('typing'));
    });

    fireEvent.click(container.querySelector('[data-id="typing-root"]') as HTMLElement);

    const input = container.querySelector('input[type="number"]') as HTMLElement;
    expect(input).not.toBeNull();

    // Backspace is how a number gets corrected, so it must not reach the brick behind the input.
    fireEvent.keyDown(input, { key: 'Backspace' });

    expect(useWorkspaceStore.getState().towers['typing']).toBeDefined();
    expect(useWorkspaceStore.getState().selectedBrickId).toBe('typing-root');
  });

  it('leaves the canvas untouched when a delete key arrives with nothing selected', () => {
    render(<Workspace config={{ palette: paletteConfig }} />);

    act(() => {
      useWorkspaceStore.getState().createTower(makeTower('lonely'));
    });

    fireEvent.keyDown(window, { key: 'Delete' });

    expect(Object.keys(useWorkspaceStore.getState().towers)).toEqual(['lonely']);
  });

  it('drops a selection whose brick is already gone rather than throwing', () => {
    render(<Workspace config={{ palette: paletteConfig }} />);

    act(() => {
      useWorkspaceStore.getState().createTower(makeTower('present'));
      useWorkspaceStore.getState().selectBrick('a-brick-that-no-longer-exists');
    });

    fireEvent.keyDown(window, { key: 'Delete' });

    expect(useWorkspaceStore.getState().selectedBrickId).toBeNull();
    expect(Object.keys(useWorkspaceStore.getState().towers)).toEqual(['present']);
  });

  it('keeps the selected brick for every key that is not Delete or Backspace', () => {
    const { container } = render(<Workspace config={{ palette: paletteConfig }} />);

    act(() => {
      useWorkspaceStore.getState().createTower(makeNestingTower('other-keys'));
    });

    fireEvent.click(container.querySelector('[data-id="other-keys-outer"]') as HTMLElement);
    fireEvent.keyDown(window, { key: 'a' });
    fireEvent.keyDown(window, { key: 'Enter' });

    expect(useWorkspaceStore.getState().towers['other-keys']).toBeDefined();
    expect(useWorkspaceStore.getState().selectedBrickId).toBe('other-keys-outer');
  });

  it('rings the selected brick in its own color and lifts it, leaving the others flat', () => {
    const { container } = render(<Workspace config={{ palette: paletteConfig }} />);

    act(() => {
      useWorkspaceStore.getState().createTower(makeNestingTower('highlight'));
    });

    fireEvent.click(container.querySelector('[data-id="highlight-outer"]') as HTMLElement);

    const selected = highlightLayerOf(container, 'highlight-outer');
    const unselected = highlightLayerOf(container, 'highlight-inner');

    // The mock bricks are #3498db, so the ring is that fill taken down to #16557f.
    expect(selected.style.filter).toContain('#16557f');
    expect(selected.style.transform).toBe('translateY(-3px)');

    expect(unselected.style.filter).toBe('');
    expect(unselected.style.transform).toBe('');
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

  describe('viewport', () => {
    it('draws the bricks inside the viewport node and keeps the controls outside it', () => {
      const tower = makeNestingTower('t1');

      const { container } = render(<Workspace config={{ palette: paletteConfig }} />);
      act(() => {
        useWorkspaceStore.getState().createTower(tower);
      });

      const viewport = queryViewport(container);
      expect(viewport).not.toBeNull();
      expect(viewport!.querySelector('[data-id="t1-outer"]')).not.toBeNull();

      // Pinned to the canvas, so a pan can never carry them out of reach.
      const zoomIn = container.querySelector('[aria-label="Zoom in"]');
      const trash = queryTrash(container);
      expect(zoomIn).not.toBeNull();
      expect(trash).not.toBeNull();
      expect(viewport!.contains(zoomIn)).toBe(false);
      expect(viewport!.contains(trash)).toBe(false);
    });

    it('draws the snap hint inside the viewport node, so it pans with the bricks', () => {
      // The overlays are placed at brick coordinates. Left outside the viewport node they would
      // stay put while the bricks slid away, and point at nothing.
      const { container } = render(<Workspace config={{ palette: paletteConfig }} />);
      act(() => {
        useConnectionPreviewStore.setState({
          activeTarget: {
            draggedTowerId: 't1',
            targetTowerId: 't2',
            targetBrickId: 'b1',
            type: 'statement',
            distance: 5,
            centroid: { x: 100, y: 150 },
          },
          isValid: true,
        });
      });

      const hint = container.querySelector('[data-testid="snap-hint-overlay"]');
      expect(hint).not.toBeNull();
      expect(queryViewport(container)!.contains(hint)).toBe(true);
    });

    it('moves the viewport node to wherever the store is panned', () => {
      const { container } = render(<Workspace config={{ palette: paletteConfig }} />);
      const viewport = queryViewport(container)!;

      expect(viewport.style.transform).toBe('translate(0px, 0px)');

      act(() => {
        useWorkspaceViewportStore.getState().panBy({ x: 40, y: 10 });
      });

      expect(viewport.style.transform).toBe('translate(40px, 10px)');
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

  describe('canvas accessibility and keyboard navigation', () => {
    it('gives the canvas container tabIndex={0} and a visible focus ring', () => {
      const { container } = render(<Workspace config={{ palette: paletteConfig }} />);
      const canvas = container.querySelector('[role="region"][aria-label="Workspace Canvas"]');

      expect(canvas).not.toBeNull();
      expect(canvas?.getAttribute('tabindex')).toBe('0');
      expect(canvas?.classList.contains('focus-visible:ring-2')).toBe(true);
      expect(canvas?.classList.contains('focus-visible:ring-ring')).toBe(true);
    });

    it('translates the world layer when viewport offset updates', () => {
      const { getByTestId } = render(<Workspace config={{ palette: paletteConfig }} />);
      const world = getByTestId('workspace-world');

      expect(world.style.transform).toBe('translate(0px, 0px)');

      act(() => {
        useViewportStore.getState().setOffset({ x: 120, y: -80 });
      });

      expect(world.style.transform).toBe('translate(120px, -80px)');
    });

    it('pans the canvas using arrow keys, PageUp/PageDown, and Home/End', () => {
      const { container } = render(<Workspace config={{ palette: paletteConfig }} />);
      const canvas = container.querySelector('[role="region"][aria-label="Workspace Canvas"]') as HTMLElement;

      fireEvent.keyDown(canvas, { key: 'ArrowUp' });
      expect(useViewportStore.getState().offset).toEqual({ x: 0, y: -50 });

      fireEvent.keyDown(canvas, { key: 'ArrowLeft' });
      expect(useViewportStore.getState().offset).toEqual({ x: -50, y: -50 });

      fireEvent.keyDown(canvas, { key: 'PageDown' });
      expect(useViewportStore.getState().offset).toEqual({ x: -50, y: 250 });

      fireEvent.keyDown(canvas, { key: 'Home' });
      expect(useViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
    });

    it('does not pan the canvas when typing inside the palette search box', () => {
      const { container } = render(<Workspace config={{ palette: paletteConfig }} />);
      const searchInput = container.querySelector('input[placeholder="Search bricks"]') as HTMLElement;

      fireEvent.keyDown(searchInput, { key: 'ArrowLeft' });
      fireEvent.keyDown(searchInput, { key: 'Home' });
      fireEvent.keyDown(searchInput, { key: 'ArrowUp' });

      expect(useViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
    });
  });
});
