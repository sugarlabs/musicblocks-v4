import type { TowerNode } from '@/@types/tower.types';
import type { StatementConnectorMeta } from '@/@types/workspace.types';
import type { CollisionObject } from './collision';
import { listVisibleNodes } from './tower-traversal';

let nextCollisionId = 1;

/**
 * Extracts statement connection points (notches) from every visible Statement brick in a tower — the `prev`
 * groove on the top edge, the `next` tab on the bottom edge, and the `nestedNext` tab on the cavity
 * roof. Calculates their absolute positions based on the `model.position` which must be up-to-date
 * from the tower layout pass.
 *
 * Only the notches a brick actually has are emitted; `getConnectorCoords` omits the rest.
 *
 * Bricks hidden inside a folded cavity contribute nothing: they are not drawn, so a snap onto one
 * would land on a notch that is not there. They rejoin the space when the fold is lifted.
 *
 * @param towerId - The ID of the tower these bricks belong to.
 * @param root - The root node of the tower tree.
 * @returns Array of collision objects and their metadata for book-keeping.
 */
export function extractStatementConnectors(
    towerId: string,
    root: TowerNode,
): { object: CollisionObject; meta: StatementConnectorMeta }[] {
    const nodes = listVisibleNodes(root);
    const results: { object: CollisionObject; meta: StatementConnectorMeta }[] = [];

    for (const node of nodes) {
        if (node.kind !== 'statement') continue;

        const brickId = node.model.id;

        // The absolute position of the top-left of the brick
        const absX = node.model.position.x;
        const absY = node.model.position.y;

        const coords = node.model.getConnectorCoords();

        // A folded brick keeps its place in the sequence, so `prev` and `next` stay, but its cavity
        // is shut: the model still reports where the roof notch sits, and it is this space that
        // decides nothing may snap into it. It is offered again when the fold is lifted.
        const nestedNext = node.model.isNestingFolded ? undefined : coords.nestedNext;

        // Each notch's bounds are centred on the notch, so the box covers exactly what a snap has to
        // line up with.
        const notches: { type: StatementConnectorMeta['type']; bounds: typeof coords.prev }[] = [
            { type: 'prev', bounds: coords.prev },
            { type: 'next', bounds: coords.next },
            { type: 'nestedNext', bounds: nestedNext },
        ];

        for (const { type, bounds } of notches) {
            if (!bounds) continue;

            const id = nextCollisionId++;
            results.push({
                object: { id, x: absX + bounds.x, y: absY + bounds.y, w: bounds.w, h: bounds.h },
                meta: { id, towerId, brickId, type },
            });
        }
    }

    return results;
}

// #700: Superseded by the `getConnectorCoords`-based extraction above, which drops the duplicated
// notch constants, the hard-coded 16x16 footprints, and the `computeOutline()` side effect needed to
// read `bounds.nesting`. Kept for reference.
//
// // Notch layout constants (matching BrickOutlineGenerator geometry)
// const TAIL_INDENT_W = 8;
// const V_NOTCH_OFFSET_X = 18;
//
// export function extractStatementConnectors(
//     towerId: string,
//     root: TowerNode,
// ): { object: CollisionObject; meta: StatementConnectorMeta }[] {
//     const nodes = listNodes(root);
//     const results: { object: CollisionObject; meta: StatementConnectorMeta }[] = [];
//
//     for (const node of nodes) {
//         if (node.kind !== 'statement') continue;
//         const stmtNode = node as TowerStatementNode;
//         const brickId = stmtNode.model.id;
//
//         // The absolute position of the top-left of the brick
//         const absX = stmtNode.model.position.x;
//         const absY = stmtNode.model.position.y;
//
//         // Prev notch (top edge)
//         if (stmtNode.model.hasConnectionPrev) {
//             const prevX = absX + V_NOTCH_OFFSET_X;
//             const prevY = absY;
//             const prevId = nextCollisionId++;
//             results.push({
//                 object: { id: prevId, x: prevX, y: prevY, w: 16, h: 16 },
//                 meta: { id: prevId, towerId, brickId, type: 'prev' },
//             });
//         }
//
//         // Next notch (bottom edge)
//         if (stmtNode.model.hasConnectionNext) {
//             const nextX = absX + V_NOTCH_OFFSET_X;
//             const nextY = absY + stmtNode.model.dims.h;
//             const nextId = nextCollisionId++;
//             results.push({
//                 object: { id: nextId, x: nextX, y: nextY, w: 16, h: 16 },
//                 meta: { id: nextId, towerId, brickId, type: 'next' },
//             });
//         }
//
//         // NestedNext notch (inner roof)
//         if (stmtNode.model.hasNesting) {
//             // If the cavity is empty, useTowerLayout skips calling computeOutline() as an optimization,
//             // which leaves bounds.nesting undefined. We force computeOutline() here so we can read it.
//             if (!stmtNode.model.bounds.nesting) {
//                 stmtNode.model.computeOutline();
//             }
//
//             if (stmtNode.model.bounds.nesting) {
//                 const nestedX = absX + TAIL_INDENT_W + V_NOTCH_OFFSET_X;
//                 // The y-coordinate of the nesting bounds represents the headHeight (where the roof starts)
//                 const nestedY = absY + stmtNode.model.bounds.nesting.y;
//                 const nestedId = nextCollisionId++;
//                 results.push({
//                     object: { id: nestedId, x: nestedX, y: nestedY, w: 16, h: 16 },
//                     meta: { id: nestedId, towerId, brickId, type: 'nestedNext' },
//                 });
//             }
//         }
//     }
//
//     return results;
// }
