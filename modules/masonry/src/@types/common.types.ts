export interface Size {
    /** Width in pixels */
    w: number;
    /** Height in pixels */
    h: number;
}

/** 2D coordinate of a point in the canvas */
export interface Point {
    /** X coordinate in pixels, measured from the left */
    x: number;
    /** Y coordinate in pixels, measured from the top */
    y: number;
}

/** Bounding rectangle of a layout region: position and size */
export interface Bounds extends Size, Point {}
