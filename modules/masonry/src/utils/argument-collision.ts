import type { TowerNode } from '@/@types/tower.types';
import type { ArgumentConnectorMeta } from '@/@types/workspace.types';

import type { CollisionObject } from './collision';
import { listNodes } from './tower-traversal';

let nextCollisionId = 1;

/**
 * Extracts argument connection points from all bricks in a tower — `input` grooves (one per
 * argument slot, filled and empty) and `output` tabs. Calculates their absolute positions based
 * on the `model.position` which must be up-to-date from the tower layout pass.
 *
 * @param towerId - The ID of the tower these bricks belong to.
 * @param root - The root node of the tower tree.
 * @returns Array of collision objects and their metadata for book-keeping.
 */
export function extractArgumentConnectors(
    towerId: string,
    root: TowerNode,
): { object: CollisionObject; meta: ArgumentConnectorMeta }[] {
    const nodes = listNodes(root);
    const results: { object: CollisionObject; meta: ArgumentConnectorMeta }[] = [];

    for (const node of nodes) {
        const brickId = node.model.id;

        // The absolute position of the top-left of the brick
        const absX = node.model.position.x;
        const absY = node.model.position.y;

        const coords = node.model.getConnectorCoords();

        // Input grooves (right edge) — one per argument slot, filled and empty
        if (node.kind === 'expression' || node.kind === 'statement') {
            coords.inputs.forEach((bounds, slotIndex) => {
                const id = nextCollisionId++;
                results.push({
                    object: {
                        id,
                        x: absX + bounds.x,
                        y: absY + bounds.y,
                        w: bounds.w,
                        h: bounds.h,
                    },
                    meta: {
                        id,
                        towerId,
                        brickId,
                        type: 'input',
                        slotIndex,
                        occupied: node.args[slotIndex] !== null,
                    },
                });
            });
        }

        // Output tab (left edge)
        if ((node.kind === 'value' || node.kind === 'expression') && coords.output) {
            const id = nextCollisionId++;
            const { output } = coords;
            results.push({
                object: { id, x: absX + output.x, y: absY + output.y, w: output.w, h: output.h },
                meta: { id, towerId, brickId, type: 'output' },
            });
        }
    }

    return results;
}
