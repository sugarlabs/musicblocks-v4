// Component test for the palette drag ghost. What it covers beyond mounting is the fold: the
// ghost builds its own model from the dragged entry's config, and a payload that says its cavity
// is shut has to be drawn shut, at the size the brick will actually land at.

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { PaletteBrickConfig } from '@/@types/palette.types';
import type { StatementBrickViewProps } from '@/@types/brick.types';

import { usePaletteDragStore } from '@/stores/palette';
import { FOLD_TOGGLE_SELECTOR } from '@/utils/constants';

import { DragGhost } from './DragGhost';

afterEach(() => {
  cleanup();
  usePaletteDragStore.setState({ dragged: null });
});

const colorsDefault = { background: '#4f46e5', foreground: '#ffffff', border: '#4338ca' };

/** A palette entry for a nesting statement brick, with its cavity in the given state. */
function nestingEntry(nesting: StatementBrickViewProps['nesting']): PaletteBrickConfig {
  return {
    id: 'repeat',
    name: 'repeat',
    description: '',
    brick: {
      kind: 'statement',
      widget: { type: 'label', text: 'repeat' },
      colorsDefault,
      tooltipText: '',
      hasConnectionPrev: true,
      hasConnectionNext: true,
      nesting,
    },
  };
}

/** Renders the ghost with `entry` already picked up, the way the drag hook leaves the store. */
function renderGhostOf(entry: PaletteBrickConfig | null) {
  usePaletteDragStore.setState({ dragged: entry });

  return render(<DragGhost ref={null} />);
}

/**
 * The height of the outline the ghost draws for `entry`, torn down afterwards.
 *
 * One ghost at a time: every mounted ghost reads the same drag store, so a second one left
 * standing would re-render onto the next payload and report its height instead.
 */
function ghostOutlineHeight(entry: PaletteBrickConfig): number {
  const { container } = renderGhostOf(entry);
  const height = Number(container.querySelector('svg')!.getAttribute('height'));
  cleanup();

  return height;
}

describe('DragGhost', () => {
  it('mounts its positioning node hidden, with no brick in it, until a drag starts', () => {
    const { container } = renderGhostOf(null);

    // The hook writes transforms to this node from the first drag frame, so it has to be there
    // before the payload is.
    expect((container.firstElementChild as HTMLElement).style.display).toBe('none');
    expect(container.querySelector('svg')).toBeNull();
  });

  it('draws a folded brick at its folded size, not the size its cavity would give it', () => {
    const folded = ghostOutlineHeight(nestingEntry({ dims: { w: 120, h: 200 }, isFolded: true }));
    const open = ghostOutlineHeight(nestingEntry({ dims: { w: 120, h: 200 }, isFolded: false }));
    const plain = ghostOutlineHeight(nestingEntry(undefined));

    // A fold withholds the cavity dims, so the ghost draws what a statement with no cavity draws —
    // which is what the brick in flight looks like, and what it will look like where it lands.
    expect(folded).toBe(plain);
    expect(open).toBeGreaterThan(folded);
  });

  it('keeps the fold toggle on a folded brick, drawn disabled with no tower behind it', () => {
    const { container } = renderGhostOf(nestingEntry({ dims: { w: 120, h: 200 }, isFolded: true }));

    const toggle = container.querySelector<HTMLButtonElement>(FOLD_TOGGLE_SELECTOR);

    expect(toggle).not.toBeNull();
    expect(toggle!.disabled).toBe(true);
  });
});
