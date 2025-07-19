import type { IBrick } from '../@types/brick';
import type { TPoint, TConnectionPoint } from '../@types/tower';
import type { ITowerNode } from '../tower/model/model';
import TowerModel from '../tower/model/model';
import type WorkspaceManager from '../workspace/model/model';

/**
 * Result of reverse mapping a point to brick/tower
 */
export interface IReverseMappingResult {
    brick: IBrick | null;
    tower: TowerModel | null;
    towerNode: ITowerNode | null;
    brickLocalPoint: TPoint | null;
    connectionPoint: TConnectionPoint | null;
    connectionType: 'top' | 'right' | 'bottom' | 'left' | null;
    connectionIndex: number | null;
}

/**
 * Utility class for reverse mapping points to bricks and towers
 */
export class ReverseMappingUtility {
    private workspaceManager: WorkspaceManager;

    constructor(workspaceManager: WorkspaceManager) {
        this.workspaceManager = workspaceManager;
    }

    findBrickAtPoint(point: TPoint): IReverseMappingResult {
        const result: IReverseMappingResult = {
            brick: null,
            tower: null,
            towerNode: null,
            brickLocalPoint: null,
            connectionPoint: null,
            connectionType: null,
            connectionIndex: null,
        };
        for (const tower of this.workspaceManager.allTowers) {
            const towerResult = this.findBrickInTower(tower, point);
            if (towerResult.brick) {
                return towerResult;
            }
        }
        return result;
    }

    findBrickInTower(tower: TowerModel, point: TPoint): IReverseMappingResult {
        const result: IReverseMappingResult = {
            brick: null,
            tower: null,
            towerNode: null,
            brickLocalPoint: null,
            connectionPoint: null,
            connectionType: null,
            connectionIndex: null,
        };
        for (const node of tower.nodesArray()) {
            const brickResult = this.checkBrickHit(node, point);
            if (brickResult.brick) {
                result.brick = brickResult.brick;
                result.tower = tower;
                result.towerNode = node;
                result.brickLocalPoint = brickResult.brickLocalPoint;
                result.connectionPoint = brickResult.connectionPoint;
                result.connectionType = brickResult.connectionType;
                result.connectionIndex = brickResult.connectionIndex;
                return result;
            }
        }
        return result;
    }

    private checkBrickHit(
        node: ITowerNode,
        point: TPoint,
    ): {
        brick: IBrick | null;
        brickLocalPoint: TPoint | null;
        connectionPoint: TConnectionPoint | null;
        connectionType: 'top' | 'right' | 'bottom' | 'left' | null;
        connectionIndex: number | null;
    } {
        const brick = node.brick;
        const brickPos = node.position;
        const bbox = brick.boundingBox;
        const localPoint: TPoint = {
            x: point.x - brickPos.x,
            y: point.y - brickPos.y,
        };
        if (
            localPoint.x >= 0 &&
            localPoint.x <= bbox.w &&
            localPoint.y >= 0 &&
            localPoint.y <= bbox.h
        ) {
            const connectionResult = this.checkConnectionPointHit(brick, localPoint);
            if (connectionResult.connectionPoint) {
                return {
                    brick,
                    brickLocalPoint: localPoint,
                    connectionPoint: connectionResult.connectionPoint,
                    connectionType: connectionResult.connectionType,
                    connectionIndex: connectionResult.connectionIndex,
                };
            }
            return {
                brick,
                brickLocalPoint: localPoint,
                connectionPoint: null,
                connectionType: null,
                connectionIndex: null,
            };
        }
        return {
            brick: null,
            brickLocalPoint: null,
            connectionPoint: null,
            connectionType: null,
            connectionIndex: null,
        };
    }

    private checkConnectionPointHit(
        brick: IBrick,
        localPoint: TPoint,
    ): {
        connectionPoint: TConnectionPoint | null;
        connectionType: 'top' | 'right' | 'bottom' | 'left' | null;
        connectionIndex: number | null;
    } {
        const connectionPoints = brick.connectionPoints;
        const hitThreshold = 8;
        if (connectionPoints.top) {
            const distance = this.calculateDistance(localPoint, connectionPoints.top);
            if (distance <= hitThreshold) {
                return {
                    connectionPoint: connectionPoints.top,
                    connectionType: 'top',
                    connectionIndex: null,
                };
            }
        }
        if (connectionPoints.right && connectionPoints.right.length > 0) {
            for (let i = 0; i < connectionPoints.right.length; i++) {
                const distance = this.calculateDistance(localPoint, connectionPoints.right[i]);
                if (distance <= hitThreshold) {
                    return {
                        connectionPoint: connectionPoints.right[i],
                        connectionType: 'right',
                        connectionIndex: i,
                    };
                }
            }
        }
        if (connectionPoints.bottom) {
            const distance = this.calculateDistance(localPoint, connectionPoints.bottom);
            if (distance <= hitThreshold) {
                return {
                    connectionPoint: connectionPoints.bottom,
                    connectionType: 'bottom',
                    connectionIndex: null,
                };
            }
        }
        if (connectionPoints.left) {
            const distance = this.calculateDistance(localPoint, connectionPoints.left);
            if (distance <= hitThreshold) {
                return {
                    connectionPoint: connectionPoints.left,
                    connectionType: 'left',
                    connectionIndex: null,
                };
            }
        }
        return {
            connectionPoint: null,
            connectionType: null,
            connectionIndex: null,
        };
    }

    private calculateDistance(p1: TPoint, p2: TPoint): number {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    findBricksInArea(topLeft: TPoint, bottomRight: TPoint): IReverseMappingResult[] {
        const results: IReverseMappingResult[] = [];
        for (const tower of this.workspaceManager.allTowers) {
            for (const node of tower.nodesArray()) {
                const brick = node.brick;
                const brickPos = node.position;
                const bbox = brick.boundingBox;
                const brickTopLeft = brickPos;
                const brickBottomRight: TPoint = {
                    x: brickPos.x + bbox.w,
                    y: brickPos.y + bbox.h,
                };
                if (this.rectanglesOverlap(topLeft, bottomRight, brickTopLeft, brickBottomRight)) {
                    results.push({
                        brick,
                        tower,
                        towerNode: node,
                        brickLocalPoint: null,
                        connectionPoint: null,
                        connectionType: null,
                        connectionIndex: null,
                    });
                }
            }
        }
        return results;
    }

    private rectanglesOverlap(
        rect1TopLeft: TPoint,
        rect1BottomRight: TPoint,
        rect2TopLeft: TPoint,
        rect2BottomRight: TPoint,
    ): boolean {
        return !(
            rect1BottomRight.x < rect2TopLeft.x ||
            rect1TopLeft.x > rect2BottomRight.x ||
            rect1BottomRight.y < rect2TopLeft.y ||
            rect1TopLeft.y > rect2BottomRight.y
        );
    }

    getBrickConnectionPoints(brickId: string): Array<{
        point: TPoint;
        type: 'top' | 'right' | 'bottom' | 'left';
        index: number | null;
        localPoint: TConnectionPoint;
    }> {
        const results: Array<{
            point: TPoint;
            type: 'top' | 'right' | 'bottom' | 'left';
            index: number | null;
            localPoint: TConnectionPoint;
        }> = [];
        for (const tower of this.workspaceManager.allTowers) {
            const node = tower.getNode(brickId);
            if (node) {
                const brick = node.brick;
                const brickPos = node.position;
                const connectionPoints = brick.connectionPoints;
                if (connectionPoints.top) {
                    results.push({
                        point: {
                            x: brickPos.x + connectionPoints.top.x,
                            y: brickPos.y + connectionPoints.top.y,
                        },
                        type: 'top',
                        index: null,
                        localPoint: connectionPoints.top,
                    });
                }
                if (connectionPoints.right && connectionPoints.right.length > 0) {
                    connectionPoints.right.forEach(
                        (localPoint: TConnectionPoint, index: number) => {
                            results.push({
                                point: {
                                    x: brickPos.x + localPoint.x,
                                    y: brickPos.y + localPoint.y,
                                },
                                type: 'right',
                                index,
                                localPoint,
                            });
                        },
                    );
                }
                if (connectionPoints.bottom) {
                    results.push({
                        point: {
                            x: brickPos.x + connectionPoints.bottom.x,
                            y: brickPos.y + connectionPoints.bottom.y,
                        },
                        type: 'bottom',
                        index: null,
                        localPoint: connectionPoints.bottom,
                    });
                }
                if (connectionPoints.left) {
                    results.push({
                        point: {
                            x: brickPos.x + connectionPoints.left.x,
                            y: brickPos.y + connectionPoints.left.y,
                        },
                        type: 'left',
                        index: null,
                        localPoint: connectionPoints.left,
                    });
                }
                break;
            }
        }
        return results;
    }
}

export function createReverseMappingUtility(
    workspaceManager: WorkspaceManager,
): ReverseMappingUtility {
    return new ReverseMappingUtility(workspaceManager);
}
