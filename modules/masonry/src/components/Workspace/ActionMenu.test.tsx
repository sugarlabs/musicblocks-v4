// Tests for the pie menu itself: what it draws over the brick, where it puts it, and what a press
// on a wedge does. The wedges are mocked so a press has something to act on and something to be
// refused by; the real three carry no behaviour of their own until #796, #797 and #798 land, and
// are checked for shape alone at the bottom of the file.

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ActionMenuWedge } from '@/@types/action-menu.types';
import type { TowerStatementNode } from '@/@types/tower.types';

import { makeEmptyStatement } from '@/mocks/tower';
import { useActionMenuStore } from '@/stores/actionMenu';
import { useBrickLayoutStore } from '@/stores/brick';
import { useWorkspaceScaleStore } from '@/stores/scale';
import { useWorkspaceStore } from '@/stores/workspace';
import { ringAtScale } from '@/utils/pie-menu';

const runs = {
  act: vi.fn<(brickId: string) => void>(),
  inert: vi.fn<(brickId: string) => void>(),
};

/** Stands in for the real ring: one wedge that acts, one that is disabled, one to fill the circle. */
const wedges: ActionMenuWedge[] = [
  {
    id: 'act',
    label: 'Act',
    tooltip: 'Does something to this brick',
    Icon: (props) => <span data-testid="icon-act" {...props} />,
    isEnabled: () => true,
    run: (brickId) => runs.act(brickId),
  },
  {
    id: 'inert',
    label: 'Inert',
    tooltip: 'Would do nothing to this brick',
    Icon: (props) => <span data-testid="icon-inert" {...props} />,
    isEnabled: () => false,
    run: (brickId) => runs.inert(brickId),
  },
  {
    id: 'third',
    label: 'Third',
    tooltip: 'Keeps the ring at three',
    Icon: (props) => <span data-testid="icon-third" {...props} />,
    isEnabled: () => true,
    run: () => {},
  },
];

vi.mock('./actionMenuWedges', () => ({ ACTION_MENU_WEDGES: wedges }));

const { ActionMenu } = await import('./ActionMenu');

// -------------------------------------------------------------------------------------------------

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  useActionMenuStore.setState({ brickId: null });
  useWorkspaceStore.setState({ towers: {}, selectedBrickId: null });
  useBrickLayoutStore.setState({ coords: {}, mounted: {}, positioned: {} });
  useWorkspaceScaleStore.setState({ level: 2 });
});

// -------------------------------------------------------------------------------------------------

/** Puts a one-brick tower on the canvas at the given coordinates, outline already computed. */
function placeBrick(id: string, x: number, y: number): TowerStatementNode {
  const node = makeEmptyStatement(id, 0, false);
  node.model.computeOutline();

  useWorkspaceStore.getState().createTower({ id: `tower-${id}`, root: node, position: { x, y } });
  useBrickLayoutStore.getState().setCoords(id, { x, y });

  return node;
}

/** Renders the menu with it already open on a brick. */
function openOn(brickId: string) {
  const view = render(<ActionMenu />);

  act(() => {
    useActionMenuStore.getState().open(brickId);
  });

  return view;
}

/** Where the menu's root has been translated to, as a pair of numbers. */
function translationOf(element: HTMLElement): { x: number; y: number } {
  const match = element.style.transform.match(/translate\((-?[\d.]+)px, (-?[\d.]+)px\)/);

  return { x: Number(match?.[1]), y: Number(match?.[2]) };
}

// -------------------------------------------------------------------------------------------------

describe('ActionMenu', () => {
  describe('what it draws', () => {
    it('draws nothing while the store names no brick', () => {
      const { queryByTestId } = render(<ActionMenu />);

      expect(queryByTestId('action-menu')).toBeNull();
    });

    it('draws one wedge per action once it is open on a brick', () => {
      placeBrick('b1', 100, 100);
      const { getAllByRole } = openOn('b1');

      expect(getAllByRole('menuitem').map((wedge) => wedge.dataset.wedge)).toEqual([
        'act',
        'inert',
        'third',
      ]);
    });

    it('gives every wedge its name, its tooltip and its icon', () => {
      placeBrick('b1', 100, 100);
      const { getByRole, getByTestId } = openOn('b1');

      const wedge = getByRole('menuitem', { name: 'Act' });
      expect(wedge.title).toBe('Does something to this brick');
      expect(getByTestId('icon-act')).not.toBeNull();
    });

    it('draws a wedge whose action would do nothing as disabled, rather than dropping it', () => {
      placeBrick('b1', 100, 100);
      const { getByRole } = openOn('b1');

      // Present and named, so the ring keeps the same three wedges in the same three places.
      expect(getByRole('menuitem', { name: 'Inert' }).getAttribute('aria-disabled')).toBe('true');
      expect(getByRole('menuitem', { name: 'Act' }).getAttribute('aria-disabled')).toBe('false');
    });

    it('leaves the hole open, taking presses on the wedges alone', () => {
      placeBrick('b1', 100, 100);
      const { getByTestId, getByRole } = openOn('b1');

      // The brick shows through the middle and stays there to be clicked and dragged, because
      // nothing but the wedges themselves is in the way of a press.
      expect(getByTestId('action-menu').className).toContain('pointer-events-none');
      expect(getByRole('menuitem', { name: 'Act' }).className).toContain('pointer-events-auto');
    });

    it('carries the attribute that spares it from the outside-press dismissal', () => {
      placeBrick('b1', 100, 100);
      const { getByTestId } = openOn('b1');

      expect(getByTestId('action-menu').hasAttribute('data-action-menu')).toBe(true);
    });

    it('draws nothing for a brick the workspace no longer holds', () => {
      // The menu can be named a brick before the canvas has laid it out, or after it has gone.
      const { queryByTestId } = openOn('never-there');

      expect(queryByTestId('action-menu')).toBeNull();
    });
  });

  describe('where it sits', () => {
    it('centres the ring on the brick at its coords entry', () => {
      const node = placeBrick('b1', 200, 120);
      const { getByTestId } = openOn('b1');

      const widget = node.model.bounds.widget;
      const { outerRadius } = ringAtScale(2);

      expect(translationOf(getByTestId('action-menu'))).toEqual({
        x: 200 + widget.x + widget.w / 2 - outerRadius,
        y: 120 + widget.y + widget.h / 2 - outerRadius,
      });
    });

    it('follows the brick when the layout moves it', () => {
      placeBrick('b1', 200, 120);
      const { getByTestId } = openOn('b1');

      const before = translationOf(getByTestId('action-menu'));

      act(() => {
        useBrickLayoutStore.getState().setCoords('b1', { x: 260, y: 150 });
      });

      const after = translationOf(getByTestId('action-menu'));
      expect(after.x - before.x).toBe(60);
      expect(after.y - before.y).toBe(30);
    });

    it('sizes itself off the scale level, so it sits on the brick at each one', () => {
      placeBrick('b1', 100, 100);
      const { getByTestId } = openOn('b1');

      const sizeAt = (level: 1 | 2 | 3) => {
        act(() => {
          useWorkspaceScaleStore.setState({ level });
        });

        return getByTestId('action-menu').style.width;
      };

      expect(sizeAt(2)).toBe(`${ringAtScale(2).outerRadius * 2}px`);
      expect(sizeAt(1)).toBe(`${ringAtScale(1).outerRadius * 2}px`);
      expect(sizeAt(3)).toBe(`${ringAtScale(3).outerRadius * 2}px`);
    });

    it('clips each wedge to its own slice of the ring', () => {
      placeBrick('b1', 100, 100);
      const { getAllByRole } = openOn('b1');

      // The clip is what makes a press land on one wedge rather than the whole ring box, and what
      // leaves the hole in the middle a hole.
      const clips = getAllByRole('menuitem').map((wedge) => wedge.style.clipPath);
      expect(clips.every((clip) => clip.startsWith('path('))).toBe(true);
      expect(new Set(clips).size).toBe(clips.length);
    });
  });

  describe('pressing a wedge', () => {
    it('acts on the brick the menu is open on', () => {
      placeBrick('b1', 100, 100);
      const { getByRole } = openOn('b1');

      fireEvent.click(getByRole('menuitem', { name: 'Act' }));

      expect(runs.act).toHaveBeenCalledWith('b1');
    });

    it('acts on the brick it was last opened on, not the one before it', () => {
      placeBrick('b1', 100, 100);
      placeBrick('b2', 300, 100);

      const { getByRole } = openOn('b1');
      act(() => {
        useActionMenuStore.getState().open('b2');
      });

      fireEvent.click(getByRole('menuitem', { name: 'Act' }));

      expect(runs.act).toHaveBeenCalledTimes(1);
      expect(runs.act).toHaveBeenCalledWith('b2');
    });

    it('closes the menu once the action has run', () => {
      placeBrick('b1', 100, 100);
      const { getByRole, queryByTestId } = openOn('b1');

      fireEvent.click(getByRole('menuitem', { name: 'Act' }));

      expect(useActionMenuStore.getState().brickId).toBeNull();
      expect(queryByTestId('action-menu')).toBeNull();
    });

    it('does nothing at all on a disabled wedge', () => {
      placeBrick('b1', 100, 100);
      const { getByRole, queryByTestId } = openOn('b1');

      fireEvent.click(getByRole('menuitem', { name: 'Inert' }));

      // `aria-disabled` leaves the button pressable as far as the browser is concerned, so the
      // menu has to refuse the press itself, and refusing it is not a reason to close.
      expect(runs.inert).not.toHaveBeenCalled();
      expect(queryByTestId('action-menu')).not.toBeNull();
    });
  });

  describe('the wedges it ships with', () => {
    it('carries the three the pie menu is specified with, each named and explained', async () => {
      const actual =
        await vi.importActual<typeof import('./actionMenuWedges')>('./actionMenuWedges');

      expect(actual.ACTION_MENU_WEDGES.map((wedge) => wedge.id)).toEqual([
        'duplicate',
        'extract',
        'trash',
      ]);

      for (const wedge of actual.ACTION_MENU_WEDGES) {
        expect(wedge.label.length).toBeGreaterThan(0);
        expect(wedge.tooltip.length).toBeGreaterThan(0);
      }

      // Each one draws something, since the icon is all a wedge shows of what it does.
      const { container } = render(
        <>
          {actual.ACTION_MENU_WEDGES.map((wedge) => (
            <wedge.Icon key={wedge.id} />
          ))}
        </>,
      );
      expect(container.querySelectorAll('svg')).toHaveLength(3);
    });
  });
});
