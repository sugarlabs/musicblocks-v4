import type { Bounds, Size, Point } from './common.types';

export interface BrickComputedDimensions {
    /** Total outer width of the brick */
    width: number;
    /** Total outer height of the brick (headHeight + tailHeight) */
    height: number;
    /** Width of the top head section containing main widget, param labels, and args */
    headWidth: number;
    /** Height of the top head section containing main widget, param labels, and args */
    headHeight: number;
    /** Width of the nesting cavity between the head and the tail step; 0 when no nesting */
    nestWidth: number;
    /** Height of the nesting cavity between the head and the tail step; 0 when no nesting */
    nestHeight: number;
    /** Width of the bottom tail step section; 0 when no nesting */
    tailWidth: number;
    /** Height of the bottom tail step section; 0 when no nesting */
    tailHeight: number;
}

export interface BrickOutlineInput {
    /**
     * Stroke width of the outline. SVG strokes are center-aligned on the path, so the path is
     * drawn inset by `strokeWidth / 2` per side to keep the stroke within the reported dimensions.
     */
    strokeWidth: number;
    /** Dimensions of the widget in the brick's primary slot (label, glyph, input control, etc.). */
    widgetDims: Size;
    /**
     * One entry per param/arg slot pair. Omit if the brick has no argument slots.
     * A right-edge notch is implicitly generated for each entry.
     */
    paramArgDims: {
        /** Dimensions of the parameter label; null if the slot has no label. */
        param: Size | null;
        /** Dimensions of the argument area; null if the slot is empty. */
        arg: Size | null;
    }[];
    /**
     * Dimensions of the nested content area.
     * - `undefined` — no nesting; tail is not rendered
     * - `null` — nesting exists but content size is unknown; falls back to minimum nesting height
     * - `Size` — nesting exists with known content dimensions
     */
    nestingDims?: Size | null;
    /** Sequence-in notch: accepts a chain from the preceding brick. Defaults to false. */
    hasPrevNotch?: boolean;
    /** Sequence-out notch: chains into the following brick. Defaults to false. */
    hasNextNotch?: boolean;
    /** Output notch: plugs into a parent's argument slot. Defaults to false. */
    hasOutputNotch?: boolean;
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
        /** Bounds of the primary widget. */
        widget: Bounds;
        /** Bounds of each parameter label; one per slot, null if the slot has no label. */
        params?: (Bounds | null)[];
        /** Bounds of each argument area; one per slot, null if the slot is empty. */
        args?: (Bounds | null)[];
        /** Bounds of the nesting cavity. */
        nesting?: Bounds;
    };
}

/**
 * Centroid coordinates of a brick's connectors, in the same unscaled SVG space as
 * `BrickOutlineOutput.path` / `.bounds`, relative to the brick's top-left origin (0, 0).
 *
 * The optional keys are present only when the corresponding feature exists:
 *   prev       — hasPrevNotch
 *   next       — hasNextNotch
 *   nestedNext — hasNesting (cavity-roof tab)
 *   output     — hasOutputNotch
 * `inputs` is always present: one Point per argument slot whose arg !== null,
 * ordered top-to-bottom; an empty array when the brick has no filled arg slots.
 */
export interface BrickConnectorCoords {
    /** Sequence-in connector centroid (top-edge groove). */
    prev?: Point;
    /** Sequence-out connector centroid (bottom-edge tab). */
    next?: Point;
    /** Nested-sequence-in connector centroid (cavity-roof tab). */
    nestedNext?: Point;
    /** Output connector centroid (left-edge tab). */
    output?: Point;
    /** Argument-slot connector centroids (right-edge grooves), one per filled slot. */
    inputs: Point[];
}

export interface BrickMinimums {
    /** Minimum total outer width of the brick */
    minWidth: number;
    /** Minimum height of the main widget content area */
    minWidgetHeight: number;
    /** Minimum height of a parameter label slot */
    minParamHeight: number;
    /** Minimum height of an argument slot */
    minArgHeight: number;
    /** Minimum height of the nesting cavity */
    minNestHeight: number;
}

// -------------------------------------------------------------------------------------------------

/** Display widgets — represent the brick's identity/operation; used by all brick kinds. */
export type WidgetDisplay =
    /** Text label identifying the brick, with an optional icon glyph. */
    | { type: 'label'; text: string; glyph?: { name?: string; src?: string; color?: string } }
    /** Static image representing the brick's identity. */
    | { type: 'graphic'; src: string }
    /** Selector for choosing a structural variant of the brick (e.g. which operator or loop type). */
    | { type: 'variant'; options: string[]; value: string };

/** Interactive input widgets — exclusively for value-kind bricks. */
export type WidgetInput =
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
export interface ParamArgPair {
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

// ── Model-based prop types ────────────────────────────────────────────────────
// These parallel the prop types above but accept a model instance instead of a
// flat configuration object. Existing types above are preserved for backward
// compatibility — do not remove them.

import type { ValueBrickModel, ExpressionBrickModel, StatementBrickModel } from '@/models/brick';

/** Model-based props for a value brick (literal, variable, or input widget). */
export interface ValueBrickViewPropsWithModel {
    kind: 'value';
    model: ValueBrickModel;
}

/** Model-based props for an expression brick (operator, function call, etc.). */
export interface ExpressionBrickViewPropsWithModel {
    kind: 'expression';
    model: ExpressionBrickModel;
}

/** Model-based props for a statement brick (statement, block, loop, conditional, etc.). */
export interface StatementBrickViewPropsWithModel {
    kind: 'statement';
    model: StatementBrickModel;
}

/** Discriminated union of all model-based brick view prop shapes; narrow via `kind`. */
export type BrickViewPropsWithModel =
    | ValueBrickViewPropsWithModel
    | ExpressionBrickViewPropsWithModel
    | StatementBrickViewPropsWithModel;
