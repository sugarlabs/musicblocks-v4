/** A simple Cartesian point */
export type TPoint = { x: number; y: number };

/** All supported physical notch pairings */
export type TNotchType = 'top-bottom' | 'right-left' | 'left-right' | 'nested';

/** A single connection‑point centroid */
export type TConnectionPoint = { x: number; y: number };

/** One logical connection between two bricks */
export type TBrickConnection = {
    from: string; // uuid of source brick
    to: string; // uuid of destination brick
    fromNotchId: string; // e.g. "right_0"
    toNotchId: string; // e.g. "left"
    type: TNotchType;
};

/** Validation result for attempted connections */
export type TConnectionValidation = {
    isValid: boolean;
    reason?: string;
};
