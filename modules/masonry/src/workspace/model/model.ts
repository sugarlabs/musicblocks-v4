import type { IBrick } from '../../@types/brick';
import TowerModel from '../../tower/model/model';
import type { TPoint, TNotchType } from '../../@types/tower';

/**
 * The **Workspace** coordinates *multiple* towers and canvas‑level concerns
 * (selection, z‑order, undo-redo, etc.).
 */
export default class WorkspaceManager {
    private towers = new Map<string, TowerModel>();
    private _nextId = 1;

    private genId(prefix = 'tower'): string {
        return `${prefix}_${this._nextId++}`;
    }

    // CRUD operations
    createTower(rootBrick: IBrick, position: TPoint): TowerModel {
        const id = this.genId();
        const tower = new TowerModel(id, rootBrick, position);
        this.towers.set(id, tower);
        return tower;
    }

    removeTower(towerId: string): boolean {
        return this.towers.delete(towerId);
    }

    getTower(towerId: string): TowerModel | undefined {
        return this.towers.get(towerId);
    }

    get allTowers(): readonly TowerModel[] {
        return Array.from(this.towers.values());
    }

    clear(): void {
        this.towers.clear();
        this._nextId = 1;
    }

    /**
     * Attempt to connect bricks that *may* live in different towers.
     * If valid and they belong to different towers, the towers are merged.
     */
    connectBricksAcrossTowers(
        fromBrickId: string,
        toBrickId: string,
        fromNotchId: string,
        toNotchId: string,
        type: TNotchType,
    ): void {
        const fromTower = this.findTowerByBrickId(fromBrickId);
        const toTower = this.findTowerByBrickId(toBrickId);
        if (!fromTower || !toTower) throw new Error('Brick(s) not found');

        if (fromTower === toTower) {
            const result = fromTower.connectBricks(
                fromBrickId,
                toBrickId,
                fromNotchId,
                toNotchId,
                type,
            );
            if (!result.isValid) throw new Error(result.reason);
            return;
        }

        const fromNode = fromTower.getNode(fromBrickId);
        const toNode = toTower.getNode(toBrickId);
        if (!fromNode || !toNode) throw new Error('Bricks not found in towers');
        if (fromNode.connectedNotches.has(fromNotchId) || toNode.connectedNotches.has(toNotchId)) {
            throw new Error('One or both notches already connected');
        }

        fromTower.mergeIn(toTower);
        this.towers.delete(toTower.id);

        const res = fromTower.connectBricks(fromBrickId, toBrickId, fromNotchId, toNotchId, type);
        if (!res.isValid) throw new Error(res.reason);
    }

    public findTowerByBrickId(brickId: string): TowerModel | undefined {
        for (const tower of this.towers.values()) {
            if (tower.hasBrick(brickId)) return tower;
        }
        return undefined;
    }
}
