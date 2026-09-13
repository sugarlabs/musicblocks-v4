import { useEffect } from 'react';

import type { TowerNode } from '@/@types/tower.types';

import { useActionMenuStore } from '@/stores/actionMenu';

/**
 * Closes the action menu once the brick it is open on is no longer there to be acted on.
 *
 * Discarding its tower, an import replacing the workspace and a fold closing over it all end the
 * same way — the brick leaves the screen while the menu still names it — so all three are answered
 * by the one question, asked of the nodes the canvas is drawing. A move or a scale change rebuilds
 * that list too and leaves the brick in it, which is exactly when the menu should stay put.
 *
 * @param visibleNodes - The nodes the canvas currently renders, folds already taken out.
 */
export function useActionMenuTarget(visibleNodes: TowerNode[]): void {
    const brickId = useActionMenuStore((state) => state.brickId);

    useEffect(() => {
        if (brickId === null) return;
        if (visibleNodes.some((node) => node.model.id === brickId)) return;

        useActionMenuStore.getState().close();
    }, [brickId, visibleNodes]);
}
