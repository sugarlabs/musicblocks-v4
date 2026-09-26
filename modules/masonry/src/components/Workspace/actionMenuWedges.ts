import { CircleQuestionMark, Copy, Scissors, Trash2 } from 'lucide-react';

import type { ActionMenuWedge } from '@/@types/action-menu.types';
import { useBrickHelpStore } from '@/stores/brickHelp';
import { useWorkspaceHistoryStore } from '@/stores/history';
import { acknowledgeTrash } from '@/stores/trash';
import { findNodeAndTower, useWorkspaceStore } from '@/stores/workspace';
import { brickHelpFor } from '@/utils/brick-help';
import { discardTower } from '@/utils/towerDiscard';

/**
 * The wedges the pie menu carries, in the order they ring the brick, starting at twelve o'clock.
 *
 * Each one's behaviour lands with its own issue — duplicate in #796, the move to the trash in #798
 * and help in #843. Extract answers `isEnabled` with `false` until its issue lands and is drawn
 * disabled.
 */
export const ACTION_MENU_WEDGES: ActionMenuWedge[] = [
    {
        id: 'duplicate',
        label: 'Duplicate',
        tooltip: 'Copy this brick and everything under it',
        Icon: Copy,
        isEnabled: () => true,
        run: (brickId: string) => {
            const copyId = useWorkspaceStore.getState().duplicateBrickToNewTower(brickId);
            if (copyId) {
                useWorkspaceHistoryStore.getState().commit();
            }
        },
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
        // As in v3, the wedge is only on the ring of a brick that has help to give. Left out
        // rather than drawn disabled, since there is no brick it could ever work on without text.
        isVisible: (brickId: string) => Boolean(findNodeAndTower(brickId)?.node.model.tooltipText),
        isEnabled: () => true,
        run: (brickId: string) => {
            const help = brickHelpFor(brickId);
            if (help !== null) useBrickHelpStore.getState().show(help);
        },
    },
    {
        id: 'trash',
        label: 'Move to trash',
        tooltip: 'Remove this brick and everything under it',
        Icon: Trash2,
        isEnabled: (brickId: string) => findNodeAndTower(brickId) !== null,
        run: (brickId: string) => {
            const found = findNodeAndTower(brickId);
            if (found === null) return;

            const { node, tower } = found;

            if (node.model.id === tower.root.model.id) {
                discardTower(tower.id);
            } else {
                const newTowerId = useWorkspaceStore
                    .getState()
                    .detachBrickToNewTower(tower.id, brickId, tower.position);
                if (newTowerId !== null) {
                    discardTower(newTowerId);
                }
            }

            useWorkspaceStore.getState().clearSelection();
            acknowledgeTrash();
        },
    },
];
