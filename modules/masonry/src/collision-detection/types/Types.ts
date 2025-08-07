// ——————————————————————————————————————
// Shared Types
// ——————————————————————————————————————
export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

/** One incoming notch in the workspace, ready for indexing + reverse‐mapping */
export interface NotchEntry {
    /** world‐space X/Y of the notch */
    x: number;
    y: number;
    /** e.g. `${brickId}::expr‐right::0` */
    notchId: string;
    brickId: string;
    towerId: string;
    type: 'expression' | 'statement';
}

export interface NotchCoordinate {
    x: number;
    y: number;
}

export interface BrickInfo {
    brickId: string;
    towerId: string;
}

export interface CollisionResult {
    sourceNotch: NotchCoordinate;
    targetNotch: NotchCoordinate;
    targetBrick: BrickInfo;
    connectionType: 'expression' | 'statement';
    distance?: number;
}
