import type { TowerNode, TowerStatementNode } from '@/@types/tower.types';
import type { StatementConnectorMeta } from '@/@types/workspace.types';
import type { CollisionObject } from './collision';
import { listNodes } from './tower-traversal';

// Notch layout constants (matching BrickOutlineGenerator geometry)
// Exported so the drag-snap probe (statement-connect.ts) measures the dragged tower's open ends
// with the exact same geometry these collision targets are built from.
export const TAIL_INDENT_W = 8;
export const V_NOTCH_OFFSET_X = 18;

let nextCollisionId = 1;

/**
 * Extracts statement connection points (notches) from all Statement bricks in a tower.
 * Calculates their absolute positions based on the `model.position` which must be
 * up-to-date from the tower layout pass.
 *
 * @param towerId - The ID of the tower these bricks belong to.
 * @param root - The root node of the tower tree.
 * @returns Array of collision objects and their metadata for book-keeping.
 */
export function extractStatementConnectors(
    towerId: string,
    root: TowerNode,
): { object: CollisionObject; meta: StatementConnectorMeta }[] {
    const nodes = listNodes(root);
    const results: { object: CollisionObject; meta: StatementConnectorMeta }[] = [];

    for (const node of nodes) {
        if (node.kind !== 'statement') continue;
        const stmtNode = node as TowerStatementNode;
        const brickId = stmtNode.model.id;

        // The absolute position of the top-left of the brick
        const absX = stmtNode.model.position.x;
        const absY = stmtNode.model.position.y;

        // Prev notch (top edge)
        if (stmtNode.model.hasConnectionPrev) {
            const prevX = absX + V_NOTCH_OFFSET_X;
            const prevY = absY;
            const prevId = nextCollisionId++;
            results.push({
                object: { id: prevId, x: prevX, y: prevY, w: 16, h: 16 },
                meta: { id: prevId, towerId, brickId, type: 'prev' },
            });
        }

        // Next notch (bottom edge)
        if (stmtNode.model.hasConnectionNext) {
            const nextX = absX + V_NOTCH_OFFSET_X;
            const nextY = absY + stmtNode.model.dims.h;
            const nextId = nextCollisionId++;
            results.push({
                object: { id: nextId, x: nextX, y: nextY, w: 16, h: 16 },
                meta: { id: nextId, towerId, brickId, type: 'next' },
            });
        }

        // NestedNext notch (inner roof)
        if (stmtNode.model.hasNesting) {
            // If the cavity is empty, useTowerLayout skips calling computeOutline() as an optimization,
            // which leaves bounds.nesting undefined. We force computeOutline() here so we can read it.
            if (!stmtNode.model.bounds.nesting) {
                stmtNode.model.computeOutline();
            }

            if (stmtNode.model.bounds.nesting) {
                const nestedX = absX + TAIL_INDENT_W + V_NOTCH_OFFSET_X;
                // The y-coordinate of the nesting bounds represents the headHeight (where the roof starts)
                const nestedY = absY + stmtNode.model.bounds.nesting.y;
                const nestedId = nextCollisionId++;
                results.push({
                    object: { id: nestedId, x: nestedX, y: nestedY, w: 16, h: 16 },
                    meta: { id: nestedId, towerId, brickId, type: 'nestedNext' },
                });
            }
        }
    }

    return results;
}
