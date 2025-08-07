// src/collision/createExpressionCollisionMap.ts
import { CollisionMap } from './CollisionMap';
import { computeIncomingNotches } from '../utils/NotchCalculator';
import { ReverseMappingUtility } from '../../utils/ReverseMappingUtility';
import type { Rect, NotchEntry } from './Types';
import type WorkspaceManager from '../../workspace/model/model';
import type { IReverseMappingResult } from '../../utils/ReverseMappingUtility';

export function createExpressionCollisionMap(workspaceManager: WorkspaceManager, bounds: Rect) {
    const map = new CollisionMap(bounds);
    const reverseUtil = new ReverseMappingUtility(workspaceManager);

    function upsertTower(tower: any) {
        // Remove old entries for this tower
        map.removeTower(tower.id);

        // Compute incoming notches and filter for expressions
        for (const node of tower.nodesArray()) {
            // compute all incoming notches for this brick
            const incoming = computeIncomingNotches(node.brick, node.position);

            // pick only the expression‐type ones
            const exprNotches = incoming.filter((n) => n.type === 'expression');

            // diagnostic: log them
            console.log(
                `[expressionMap] upserting tower ${tower.id}, found exprNotches=`,
                exprNotches,
            );

            // insert each into the quadtree
            for (const notch of exprNotches) {
                notch.towerId = tower.id;
                map.insertNotch(notch);
            }
        }
    }

    function removeTower(id: string) {
        map.removeTower(id);
    }

    function query(x: number, y: number, radius = 1): NotchEntry[] {
        return map.query(x, y, radius);
    }

    function findHit(x: number, y: number): IReverseMappingResult | null {
        const hits = query(x, y);
        if (!hits.length) return null;
        const { x: hx, y: hy } = hits[0];
        return reverseUtil.findBrickAtPoint({ x: hx, y: hy });
    }

    return { upsertTower, removeTower, query, findHit };
}
