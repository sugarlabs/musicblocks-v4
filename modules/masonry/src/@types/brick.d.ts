/**
 * @type
 * Type (Simple Statement, Expression, Compound Statement) of a brick
 */

export type TBrickType = 'Simple' | 'Expression' | 'Compound';

/**
 * @type
 * Bounding box dimensions of a brick.
 */
export type TExtent = {
    w: number;
    h: number;
};

/**
 * @type
 * Defines color property of a brick. Supported types are RGB, HSL, and hexadecimal.
 */
export type TColor = ['rgb' | 'hsl', number, number, number] | string;

// -------------------------------------------------------------------------------------------------

export type TVisualState =
    | 'default'
    | 'selected'
    | 'hovered'
    | 'executing'
    | 'unconnected'
    | 'dragged';

type TBrickRenderProps = {
    path: string;
    label: string;
    labelType: 'text' | 'glyph' | 'icon' | 'thumbnail';
    colorBg: TColor;
    colorFg: TColor;
    strokeColor: TColor;
    strokeWidth: number;
    scale: number;
    shadow: boolean;
    tooltip?: string;
    bboxArgs: TExtent[];

    visualState: TVisualState;
    isActionMenuOpen: boolean;
    isVisible: boolean;
};

export type TBrickRenderPropsExpression = TBrickRenderProps & {
    value: undefined | boolean | number | string;
    isValueSelectOpen: boolean;
};

export type TBrickRenderPropsSimple = TBrickRenderProps & {
    topNotch: boolean;
    bottomNotch: boolean;
};

export type TBrickRenderPropsCompound = TBrickRenderProps & {
    topNotch: boolean;
    bottomNotch: boolean;
    bboxNest: TExtent[];
    isFolded: boolean;
};

import { TConnectionPoints } from '../../tree/model/model';

/**
 * @interface
 * Type definition of a brick (any type).
 */
export interface IBrick {
    get uuid(): string;
    get name(): string;
    get type(): TBrickType;
    set scale(value: number);
    get boundingBox(): TExtent;
    connectionPoints: TConnectionPoints;

    get visualState(): TVisualState;
    set visualState(value: TVisualState);

    get isActionMenuOpen(): boolean;
    set isActionMenuOpen(value: boolean);

    get isVisible(): boolean;
    set isVisible(value: boolean);
}

/**
 * @interface
 * Type definition of a Simple Statement brick.
 */
export interface IBrickExpression extends IBrick {
    get isValueSelectOpen(): boolean;
    get value(): undefined | boolean | number | string;

    get renderProps(): TBrickRenderPropsExpression;
}

/**
 * @interface
 * Type definition of a Expression brick.
 */
export interface IBrickSimple extends IBrick {
    get topNotch(): boolean;
    get bottomNotch(): boolean;

    get renderProps(): TBrickRenderPropsSimple;
}

export interface IBrickCompound extends IBrick {
    get topNotch(): boolean;
    get bottomNotch(): boolean;
    get bboxNest(): TExtent[];

    get isFolded(): boolean;
    set isFolded(value: boolean);

    get renderProps(): TBrickRenderPropsCompound;

    /**
     * Sets the bounding box extents for the nested area
     * @param extent width and height values of the nest area
     */
    setBoundingBoxNest(extent: TExtent[]): void;
}

// -------------------------------------------------------------------------------------------------

export interface Size {
    /** Width in pixels */
    w: number;
    /** Height in pixels */
    h: number;
}

/** 2D coordinate of a point in the SVG canvas */
export interface Point {
    /** X coordinate in pixels, measured from the left */
    x: number;
    /** Y coordinate in pixels, measured from the top */
    y: number;
}

/** Bounding rectangle of a layout region: position and size */
export interface Bounds extends Size, Point {}

export interface BrickOutlineInput2 {
    /**
     * Stroke width of the outline. The outline is drawn inset by `strokeWidth / 2`
     * so the stroke stays inside the reported width/height instead of being clipped.
     * Pass 0 for no inset (original geometry).
     */
    strokeWidth: number;
    /** Dimensions of the label text area */
    labelDims: Size;
    /** One entry per argument slot; each pairs a parameter label with its argument */
    paramArgDims: {
        /** Dimensions of the parameter label; null if the slot has no label (uses MIN_PARAM_H) */
        param: Size | null;
        /** Dimensions of the argument area; null if the slot has no argument (uses MIN_ARG_H) */
        arg: Size | null;
    }[];
    /**
     * Dimensions of the nested content area.
     * - `undefined` — no nesting, tail is not rendered
     * - `null` — nesting exists but content dimensions are unknown; falls back to MIN_NEST_HEIGHT
     * - `Size` — nesting exists with known content dimensions
     */
    nestingDims?: Size | null;
}

export interface BrickOutlineOutput2 {
    /** SVG path string tracing the brick outline */
    path: string;
    /** Total outer width of the brick */
    width: number;
    /** Total outer height of the brick */
    height: number;
    /** Bounding rectangles for each layout region */
    bounds: {
        /** Bounds of the label area */
        label: Bounds;
        /** Bounds of each parameter label area; absent when no params are provided */
        params?: Bounds[];
        /** Bounds of each argument area; absent when no args are provided */
        args?: Bounds[];
        /** Bounds of the nesting cavity; absent when there is no nesting */
        nesting?: Bounds;
    };
}
