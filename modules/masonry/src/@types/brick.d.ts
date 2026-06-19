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
    hasTopNotch?: boolean;
    /** Whether to draw a bottom notch (protruding tab). Defaults to false. */
    hasBottomNotch?: boolean;
    /** Whether to draw a left notch (convex tab where this brick plugs into its parent). Defaults to false. */
    hasLeftNotch?: boolean;
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

// -------------------------------------------------------------------------------------------------

/** Display widgets — represent the brick's identity/operation; used by all brick kinds. */
type WidgetDisplay =
    /** Text label identifying the brick, with an optional icon glyph. */
    | { type: 'label'; text: string; glyph?: { name: string; color: string } }
    /** Static image representing the brick's identity. */
    | { type: 'graphic'; src: string }
    /** Selector for choosing a structural variant of the brick (e.g. which operator or loop type). */
    | { type: 'variant'; options: string[]; value: string };

/** Interactive input widgets — exclusively for value-kind bricks. */
type WidgetInput =
    /** Freeform text input. */
    | { type: 'textbox'; value: string; maxLength?: number }
    /** Numeric input with optional bounds and increment step. */
    | { type: 'numberbox'; value: number; min?: number; max?: number; step?: number }
    /** Boolean on/off toggle with optional state labels. */
    | { type: 'toggle'; value: boolean; labels?: { on: string; off: string } }
    /** Range slider; min and max are required, step defaults to 1. */
    | { type: 'slider'; value: number; min: number; max: number; step?: number }
    /** Selection from a fixed set of value options. */
    | { type: 'select'; options: string[]; value: string };

/** A pair of a parameter label and its argument slot. */
interface ParamArgPair {
    /** Parameter label; omitted if the slot has no label. */
    param?: string;
    /** Dimensions of the argument slot; null if the slot is empty. */
    argDims: Size | null;
}

/** Props shared by every brick kind. */
interface BrickViewPropsBase {
    /** Colors used in the default (non-highlighted, non-selected) render state. */
    colorsDefault: {
        background: string;
        foreground: string;
        border: string;
    };
    /** Tooltip text displayed on hover. */
    tooltipText: string;
    /** Controls brick size and font scaling; defaults to 2. */
    scaleLevel?: 1 | 2 | 3;

    // TODO: colorsHighlight — colors to use when the brick is in highlighted state (mirrors colorsDefault shape)
    // TODO: shadow — brick drop-shadow spec (e.g. offset, blur, color)
}

/** A terminal value brick — literal, variable, constant, or input widget. */
export interface ValueBrickViewProps extends BrickViewPropsBase {
    kind: 'value';
    widget: WidgetDisplay | WidgetInput;
}

/** A value-producing brick with one or more argument slots — operator, function call, etc. */
export interface ExpressionBrickViewProps extends BrickViewPropsBase {
    kind: 'expression';
    widget: WidgetDisplay;
    /** At least one param/arg pair is required. */
    paramArgs: [ParamArgPair, ...ParamArgPair[]];
}

/** An executable brick that participates in a sequence — statement, block, loop, conditional, etc. */
export interface StatementBrickViewProps extends BrickViewPropsBase {
    kind: 'statement';
    widget: WidgetDisplay;
    /** Omitted if the brick has no param/arg slots. */
    paramArgs?: ParamArgPair[];
    /**
     * Nesting cavity configuration. Omit entirely if the brick has no cavity.
     *   dims: null — cavity exists but content size is unknown; falls back to minimum height
     *   dims: Size — cavity exists with known content dimensions
     * isFolded collapses the cavity to zero height when true; defaults to false.
     */
    nesting?: {
        dims: Size | null;
        isFolded: boolean;
    };
    /** Whether this brick connects to the preceding brick in a sequence. */
    hasConnectionPrev?: boolean;
    /** Whether this brick connects to the following brick in a sequence. */
    hasConnectionNext?: boolean;

    // TODO: hasSwitchButton — renders a button to swap to an alternate brick type
}

/** Discriminated union over all brick kinds; narrow via `kind`. */
export type BrickViewProps =
    | ValueBrickViewProps
    | ExpressionBrickViewProps
    | StatementBrickViewProps;

/** Props for the `BrickViewFixed` sub-component: like `BrickViewProps`, but a value brick's widget is display-only (no input widget). */
export type BrickViewFixedProps =
    | (Omit<ValueBrickViewProps, 'widget'> & { widget: WidgetDisplay })
    | ExpressionBrickViewProps
    | StatementBrickViewProps;
