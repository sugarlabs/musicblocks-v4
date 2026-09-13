import { Copy, Scissors, Trash2 } from 'lucide-react';

import type { ActionMenuWedge } from '@/@types/action-menu.types';

/**
 * The wedges the pie menu carries, in the order they ring the brick, starting at twelve o'clock.
 *
 * Each one's behaviour lands with its own issue — duplicate in #796, extract in #797 and the move
 * to the trash in #798 — so all three answer `isEnabled` with `false` until then and are drawn
 * disabled. That is the same path a wedge takes whenever its action has nothing to do on the brick
 * under it, which is why the menu needs no placeholder state of its own to carry it.
 */
export const ACTION_MENU_WEDGES: ActionMenuWedge[] = [
    {
        id: 'duplicate',
        label: 'Duplicate',
        tooltip: 'Copy this brick and everything under it',
        Icon: Copy,
        isEnabled: () => false,
        run: () => {},
    },
    {
        id: 'extract',
        label: 'Extract',
        tooltip: 'Take this brick out on its own, closing the gap it leaves',
        Icon: Scissors,
        isEnabled: () => false,
        run: () => {},
    },
    {
        id: 'trash',
        label: 'Move to trash',
        tooltip: 'Remove this brick and everything under it',
        Icon: Trash2,
        isEnabled: () => false,
        run: () => {},
    },
];
