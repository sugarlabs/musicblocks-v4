import { useBrickLayoutStore } from '@/stores/brick';
import { useWorkspaceStore } from '@/stores/workspace';
import { listNodes } from '@/utils/tower-traversal';

/**
 * Takes a tower off the workspace for good, along with the layout state of every brick in it.
 *
 * `removeTower` alone leaves the tower's bricks behind in the layout store, so their `coords`,
 * `mounted` and `positioned` entries would accumulate for bricks that no longer exist. The two
 * stores are therefore cleared together here, in an order that matters: the tower has to leave the
 * workspace graph first, because `TowerBrick` reads `coords[id]` without a guard and would fault if
 * a brick were still rendered when its entry disappeared. Both writes land in the same task, so
 * React renders once, with the tower already gone and its entries already dropped.
 *
 * The tower's connector points need no separate cleanup — `removeTower` purges those from both
 * Collision spaces, along with their book-keeping.
 *
 * @param towerId - The ID of the tower to discard.
 * @returns Whether a tower was discarded, i.e. whether one was still there to discard.
 */
export function discardTower(towerId: string): boolean {
    const workspace = useWorkspaceStore.getState();
    const tower = workspace.towers[towerId];

    if (!tower) return false;

    // Listed up front: removing the tower drops the only reference to its node graph, and with it
    // any way to tell which bricks the layout entries belonged to.
    const brickIds = listNodes(tower.root).map((node) => node.model.id);

    workspace.removeTower(towerId);
    useBrickLayoutStore.getState().clearBricks(brickIds);

    return true;
}
