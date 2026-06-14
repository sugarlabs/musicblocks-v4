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

export interface BrickOutlineInput {
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
    /** Whether to draw a top notch (downward groove). Defaults to false. */
    topNotch?: boolean;
    /** Whether to draw a bottom notch (protruding tab). Defaults to false. */
    bottomNotch?: boolean;
    /** Whether to draw a nested-top notch (smaller tab on cavity roof). Only used with nesting. */
    nestedTopNotch?: boolean;
    /** Whether to draw a nested-bottom notch (full-size groove on cavity floor). Only used with nesting. */
    nestedBottomNotch?: boolean;
    /**
     * Whether to draw the convex semicircular tab on the left edge (where this brick plugs
     * into its parent). The tab protrusion is intentionally excluded from width/height;
     * defaults to false. The right-edge grooves need no flag — they follow the arguments.
     */
    leftNotch?: boolean;
}

export interface BrickOutlineOutput {
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
    /** Always 0 (top notch goes inward). */
    topNotchDepth: number;
    /** Downward protrusion distance of the bottom notch. */
    bottomNotchDepth: number;
    /** Always 0 (nested-top tab goes inward into cavity). */
    nestedTopNotchDepth: number;
    /** Downward protrusion of nested-bottom groove into the foot. */
    nestedBottomNotchDepth: number;
    /**
     * How far the left-edge tabs protrude beyond the brick's left edge (x = 0), in SVG
     * units. Excluded from width/height by design; renderers may use it as a viewing
     * gutter so the tabs aren't clipped. 0 when there are no left tabs.
     */
    leftNotchDepth: number;
}

export interface BrickViewProps {
    /** Display text content of the brick label */
    label: string;
    /** Controls brick size and font scaling; defaults to 1 */
    scaleLevel?: 1 | 2 | 3;
    /** Whether to draw a top notch (downward groove from top edge). Defaults to false. */
    topNotch?: boolean;
    /** Whether to draw a bottom notch (tab protruding below bottom edge). Defaults to false. */
    bottomNotch?: boolean;
}

export interface BrickMinimums {
    /** Minimum total outer width of the brick */
    minWidth: number;
    /** Minimum height of the label content area */
    minLabelHeight: number;
    /** Minimum height of the nesting cavity */
    minNestHeight: number;
    /** Minimum height of a parameter label slot */
    minParamHeight: number;
    /** Minimum height of an argument slot */
    minArgHeight: number;
}
