// Component smoke test for the Workspace's palette drag wiring. Renders into jsdom via React
// Testing Library. interact.js pointer choreography (real pointerdown/move/up sequences) is not
// reproducible reliably under jsdom, so drag start/move/end behavior itself is covered by the
// pure-function tests in useDragFromPalette.test.tsx and exercised manually via the playground;
// this file verifies the pieces mount and react to the drag store correctly.

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { PaletteConfig } from '@/@types/palette.types';

import { usePaletteDragStore } from '@/stores/palette';
import { useWorkspaceStore } from '@/stores/workspace';

import { Workspace } from './Workspace';

afterEach(() => {
  cleanup();
  usePaletteDragStore.setState({ dragged: null });
  useWorkspaceStore.setState({ towers: {} });
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
});
