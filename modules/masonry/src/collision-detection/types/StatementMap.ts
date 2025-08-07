import { CollisionMap } from './CollisionMap';
import { ReverseMappingUtility } from '../../utils/ReverseMappingUtility';
import type { Rect, NotchEntry } from './Types';
import type WorkspaceManager from '../../workspace/model/model';
import type { IReverseMappingResult } from '../../utils/ReverseMappingUtility';
import { computeIncomingNotches } from '../utils/NotchCalculator';

export function createStatementCollisionMap(workspaceManager: WorkspaceManager, bounds: Rect) {
    const map = new CollisionMap(bounds);
    const reverseUtil = new ReverseMappingUtility(workspaceManager);

    function upsertTower(tower: any) {
        map.removeTower(tower.id);

        for (const node of tower.nodesArray()) {
            const incoming = computeIncomingNotches(node.brick, node.position).filter(
                (n) => n.type === 'statement',
            );
            for (const notch of incoming) {
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
        const hits = map.query(x, y);
        if (!hits.length) return null;
        const { x: hx, y: hy } = hits[0];
        return reverseUtil.findBrickAtPoint({ x: hx, y: hy });
    }

    return { upsertTower, removeTower, query, findHit };
}
