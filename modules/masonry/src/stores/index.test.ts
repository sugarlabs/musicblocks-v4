// Unit tests for the palette drag store slice. Store-only logic — no DOM — so this runs in the
// node environment. Per-frame drag positions are deliberately absent from the store (they are
// written straight to the ghost DOM node), so only the payload lifecycle is covered here.

import { afterEach, describe, expect, it } from 'vitest';

import type { PaletteBrickConfig } from '@/@types/palette.types';

import { usePaletteDragStore } from './index';

// -------------------------------------------------------------------------------------------------

const entry: PaletteBrickConfig = {
    id: 'r1',
    name: 'Note',
    description: 'play a note',
    brick: {
        kind: 'statement',
        widget: { type: 'label', text: 'Note' },
        colorsDefault: { background: '#e07a5f', foreground: '#ffffff', border: '#00000033' },
        tooltipText: 'play a note',
    },
};

afterEach(() => {
    usePaletteDragStore.setState({ dragged: null });
});

// -------------------------------------------------------------------------------------------------

describe('usePaletteDragStore', () => {
    it('starts with no active drag', () => {
        expect(usePaletteDragStore.getState().dragged).toBeNull();
    });

    it('startDrag stores the dragged palette entry as the active payload', () => {
        usePaletteDragStore.getState().startDrag(entry);

        expect(usePaletteDragStore.getState().dragged).toBe(entry);
    });

    it('endDrag clears the active payload', () => {
        usePaletteDragStore.getState().startDrag(entry);
        usePaletteDragStore.getState().endDrag();

        expect(usePaletteDragStore.getState().dragged).toBeNull();
    });

    it('a new startDrag replaces a payload left over from a previous drag', () => {
        const other: PaletteBrickConfig = { ...entry, id: 'r2', name: 'Rest' };

        usePaletteDragStore.getState().startDrag(entry);
        usePaletteDragStore.getState().startDrag(other);

        expect(usePaletteDragStore.getState().dragged).toBe(other);
    });
});
