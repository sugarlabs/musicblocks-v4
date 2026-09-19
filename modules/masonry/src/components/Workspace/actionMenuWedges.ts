import { Copy, Scissors, Trash2 } from 'lucide-react';

import type { ActionMenuWedge } from '@/@types/action-menu.types';
import { useWorkspaceHistoryStore } from '@/stores/history';
import { acknowledgeTrash } from '@/stores/trash';
import { canExtractBrick, findNodeAndTower, useWorkspaceStore } from '@/stores/workspace';
import { discardTower } from '@/utils/towerDiscard';

/**
 * The wedges the pie menu carries, in the order they ring the brick, starting at twelve o'clock.
 *
 * Each one's behaviour lands with its own issue — duplicate in #796 and the move to the trash in
 * #798. Extract answers `isEnabled` with `false` until its issue lands and is drawn disabled.
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
        isEnabled: (brickId: string) => canExtractBrick(brickId),
        run: (brickId: string) => {
            useWorkspaceStore.getState().extractBrickToNewTower(brickId);
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
