import { CircleQuestionMark, Copy, Scissors, Trash2 } from 'lucide-react';

import type { ActionMenuWedge } from '@/@types/action-menu.types';

import { useBrickHelpStore } from '@/stores/brickHelp';
import { findNodeAndTower } from '@/stores/workspace';

/**
 * The wedges the pie menu carries, in the order they ring the brick, starting at twelve o'clock.
 *
 * Duplicate, extract and the move to the trash each land with their own issue — #796, #797 and
 * #798 — so those three answer `isEnabled` with `false` until then and are drawn disabled. That is
 * the same path a wedge takes whenever its action has nothing to do on the brick under it, which is
 * why the menu needs no placeholder state of its own to carry it. Help (#843) is live: it is how a
 * brick in the workspace gives up its tooltip, now that hovering every brick is off the table.
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
        id: 'help',
        label: 'Help',
        tooltip: 'Show what this brick does',
        Icon: CircleQuestionMark,
        // Nothing to show for a brick with no tooltip text of its own.
        isEnabled: (brickId) => Boolean(findNodeAndTower(brickId)?.node.model.tooltipText),
        run: (brickId) => useBrickHelpStore.getState().show(brickId),
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
