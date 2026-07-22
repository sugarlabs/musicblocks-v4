import type {
    BrickConnectorCoords,
    BrickOutlineInput,
    BrickOutlineOutput,
    WidgetDisplay,
    WidgetInput,
} from '@/@types/brick.types';
import type { Bounds, Point, Size } from '@/@types/common.types';

import { BrickOutlineGenerator } from '@/utils/brick-shape';
import { SCALE_LEVEL_CONFIG } from '@/utils/constants';

const STROKE_WIDTH = 2;

// ─────────────────────────────────────────────────────────────────────────────

abstract class BrickModelBase {
    abstract readonly kind: 'value' | 'expression' | 'statement';

    readonly id: string;
    readonly colorsDefault: {
        readonly background: string;
        readonly foreground: string;
        readonly border: string;
    };
    readonly tooltipText: string;

    /** Rendered size of the primary widget; set by the view after measurement. */
    widgetDims: Size = { w: 0, h: 0 };

    private _dims: Size = { w: 0, h: 0 };
    private _path: string = '';
    private _bounds: BrickOutlineOutput['bounds'] = { widget: { x: 0, y: 0, w: 0, h: 0 } };
    private _position: Point = { x: 0, y: 0 };

    get dims(): Size {
        return this._dims;
    }

    get path(): string {
        return this._path;
    }

    get bounds(): BrickOutlineOutput['bounds'] {
        return this._bounds;
    }

    get position(): Point {
        return this._position;
    }

    /**
     * Called by the layout engine to persist the brick's position within its tower.
     * Intentionally does not notify update callbacks — position must not trigger re-renders.
     */
    public setPosition(x: number, y: number): void {
        this._position = { x, y };
    }

    private _scaleLevel: 1 | 2 | 3;
    private _outlineGenerator: BrickOutlineGenerator;

    get scaleLevel(): 1 | 2 | 3 {
        return this._scaleLevel;
    }

    set scaleLevel(value: 1 | 2 | 3) {
        this._scaleLevel = value;
        this._outlineGenerator = BrickModelBase._buildOutlineGenerator(value);
        this._notifyUpdate();
    }

    protected get outlineGenerator(): BrickOutlineGenerator {
        return this._outlineGenerator;
    }

    /** Converts a pixel value to SVG units for the current scale level. */
    protected pxToSvg(px: number): number {
        return px / SCALE_LEVEL_CONFIG[this._scaleLevel].brickScale;
    }

    /** Converts an SVG-unit value to canvas pixels for the current scale level. */
    protected svgToPx(svg: number): number {
        return svg * SCALE_LEVEL_CONFIG[this._scaleLevel].brickScale;
    }

    /** Assembles the generator input from this brick's current state. */
    protected abstract _buildOutlineInput(): BrickOutlineInput;

    /** Recomputes outer dimensions using the outline generator and stores them in `dims`. */
    public computeDims(): void {
        const { width, height } = this.outlineGenerator.computeDimensions(
            this._buildOutlineInput(),
        );
        this._dims = { w: width, h: height };
    }

    /** Generates the SVG path and layout bounds and stores them in `path` and `bounds`. */
    public computeOutline(): void {
        const { width, height, path, bounds } = this.outlineGenerator.generate(
            this._buildOutlineInput(),
        );
        this._dims = { w: width, h: height };
        this._path = path;
        this._bounds = bounds;
    }

    /**
     * Reports the bounds of every connector this brick has, in CANVAS PX (scaled for the
     * current scale level) relative to the brick's top-left origin. The underlying generator
     * returns unscaled SVG-space coords; each connector's bounds are multiplied by `brickScale` here.
     *
     * Optional connectors (prev/next/nestedNext/output) are present only when their feature is
     * enabled; `inputs` is always an array with one entry per argument slot (filled and empty),
     * top-to-bottom, tagged with the slot index and its filled state.
     */
    public getConnectorCoords(): BrickConnectorCoords {
        const raw = this.outlineGenerator.getConnectorCoords(this._buildOutlineInput());
        const scaleBounds = (bounds: Bounds): Bounds => ({
            x: this.svgToPx(bounds.x),
            y: this.svgToPx(bounds.y),
            w: this.svgToPx(bounds.w),
            h: this.svgToPx(bounds.h),
        });
        const scaled: BrickConnectorCoords = {
            inputs: raw.inputs.map((s) => ({
                bounds: scaleBounds(s.bounds),
                index: s.index,
                filled: s.filled,
            })),
        };
        if (raw.prev) scaled.prev = scaleBounds(raw.prev);
        if (raw.next) scaled.next = scaleBounds(raw.next);
        if (raw.nestedNext) scaled.nestedNext = scaleBounds(raw.nestedNext);
        if (raw.output) scaled.output = scaleBounds(raw.output);
        return scaled;
    }

    private static _buildOutlineGenerator(level: 1 | 2 | 3): BrickOutlineGenerator {
        const { brickScale, minWidth, minArgNestHeight, minWidgetParamHeight } =
            SCALE_LEVEL_CONFIG[level];
        const pxToSvg = (px: number) => px / brickScale;
        return new BrickOutlineGenerator({
            minWidth: pxToSvg(minWidth),
            minWidgetHeight: pxToSvg(minWidgetParamHeight),
            minParamHeight: pxToSvg(minWidgetParamHeight),
            minArgHeight: pxToSvg(minArgNestHeight),
            minNestHeight: pxToSvg(minArgNestHeight),
        });
    }

    // ── Callback registration ─────────────────────────────────────────────────

    /**
     * The set of registered update callbacks. These functions are called whenever
     * model state that affects rendering changes (argDims, nestingDims, scaleLevel).
     *
     * Note: `widgetDims` is written by the view after measuring the DOM and
     * intentionally does NOT trigger this callback to avoid a re-render loop.
     */
    private _updateCallbacks = new Set<() => void>();

    /**
     * Registers a callback that will be invoked whenever the model's rendering
     * state changes.
     *
     * Intended usage (React):
     * ```ts
     * useEffect(() => {
     *   const cb = () => setTick(t => t + 1);
     *   model.registerUpdateCallback(cb);
     *   return () => model.unregisterUpdateCallback(cb);
     * }, [model]);
     * ```
     */
    public registerUpdateCallback(cb: () => void): void {
        this._updateCallbacks.add(cb);
    }

    /** Removes a specifically registered update callback. */
    public unregisterUpdateCallback(cb: () => void): void {
        this._updateCallbacks.delete(cb);
    }

    /** Invokes all registered callbacks. Called from mutating setters. */
    protected _notifyUpdate(): void {
        for (const cb of this._updateCallbacks) {
            cb();
        }
    }

    constructor(config: {
        id?: string;
        colorsDefault: { background: string; foreground: string; border: string };
        tooltipText: string;
        scaleLevel?: 1 | 2 | 3;
    }) {
        this.id = config.id ?? crypto.randomUUID();
        this.colorsDefault = config.colorsDefault;
        this.tooltipText = config.tooltipText;
        this._scaleLevel = config.scaleLevel ?? 2;
        this._outlineGenerator = BrickModelBase._buildOutlineGenerator(this._scaleLevel);
    }
}

// ─────────────────────────────────────────────────────────────────────────────

/** Terminal value brick — literal, variable, constant, or direct input widget. */
export class ValueBrickModel extends BrickModelBase {
    readonly kind = 'value' as const;

    // The widget kind is fixed at creation; for input/variant widgets the inner
    // value field may be mutated directly as the user interacts.
    readonly widget: WidgetDisplay | WidgetInput;

    protected _buildOutlineInput(): BrickOutlineInput {
        return {
            strokeWidth: this.pxToSvg(STROKE_WIDTH),
            widgetDims: { w: this.pxToSvg(this.widgetDims.w), h: this.pxToSvg(this.widgetDims.h) },
            paramArgDims: [],
            hasOutputNotch: true,
        };
    }

    constructor(config: {
        id?: string;
        colorsDefault: { background: string; foreground: string; border: string };
        tooltipText: string;
        scaleLevel?: 1 | 2 | 3;
        widget: WidgetDisplay | WidgetInput;
    }) {
        super(config);
        this.widget = config.widget;
    }
}

// ─────────────────────────────────────────────────────────────────────────────

/** Value-producing brick with argument slots — operator, function call, etc. */
export class ExpressionBrickModel extends BrickModelBase {
    readonly kind = 'expression' as const;

    // For variant widgets, the inner value field may be mutated.
    readonly widget: WidgetDisplay;

    // At least one slot is required; labels are structural and fixed.
    readonly params: readonly [string | null, ...(string | null)[]];

    /** Rendered sizes of the param labels; set by the view after measurement. */
    paramDims: (Size | null)[];

    private _argDims: (Size | null)[];

    get argDims(): (Size | null)[] {
        return this._argDims;
    }

    set argDims(value: (Size | null)[]) {
        this._argDims = value;
        this._notifyUpdate();
    }

    protected _buildOutlineInput(): BrickOutlineInput {
        return {
            strokeWidth: this.pxToSvg(STROKE_WIDTH),
            widgetDims: { w: this.pxToSvg(this.widgetDims.w), h: this.pxToSvg(this.widgetDims.h) },
            paramArgDims: this._argDims.map((dim, i) => ({
                param: this.paramDims[i]
                    ? {
                          w: this.pxToSvg(this.paramDims[i]!.w),
                          h: this.pxToSvg(this.paramDims[i]!.h),
                      }
                    : null,
                arg: dim ? { w: this.pxToSvg(dim.w), h: this.pxToSvg(dim.h) } : null,
            })),
            hasOutputNotch: true,
        };
    }

    constructor(config: {
        id?: string;
        colorsDefault: { background: string; foreground: string; border: string };
        tooltipText: string;
        scaleLevel?: 1 | 2 | 3;
        widget: WidgetDisplay;
        params: [string | null, ...(string | null)[]];
        argDims?: (Size | null)[];
    }) {
        super(config);
        this.widget = config.widget;
        this.params = config.params;
        this.paramDims = config.params.map(() => null);
        this._argDims = config.argDims ?? config.params.map(() => null);
    }
}

// ─────────────────────────────────────────────────────────────────────────────

/** Executable brick that participates in a sequence — statement, block, loop, conditional, etc. */
export class StatementBrickModel extends BrickModelBase {
    readonly kind = 'statement' as const;

    // For variant widgets, the inner value field may be mutated.
    readonly widget: WidgetDisplay;

    // Param labels are structural and fixed; slot count won't change.
    readonly params: readonly (string | null)[];

    /** Rendered sizes of the param labels; set by the view after measurement. */
    paramDims: (Size | null)[];

    private _argDims: (Size | null)[];

    get argDims(): (Size | null)[] {
        return this._argDims;
    }

    set argDims(value: (Size | null)[]) {
        this._argDims = value;
        this._notifyUpdate();
    }

    // Whether this brick structurally has a nesting cavity — fixed at creation.
    readonly hasNesting: boolean;

    private _nestingDims: Size | null;

    get nestingDims(): Size | null {
        return this._nestingDims;
    }

    set nestingDims(value: Size | null) {
        this._nestingDims = value;
        this._notifyUpdate();
    }

    // Mutable: change as bricks are linked or unlinked in a sequence.
    hasConnectionPrev: boolean;
    hasConnectionNext: boolean;

    // Mutable: toggled by the user to collapse or expand the nesting cavity.
    isNestingFolded: boolean;

    protected _buildOutlineInput(): BrickOutlineInput {
        let nestingDims: Size | null | undefined;
        if (this.hasNesting) {
            nestingDims = this._nestingDims
                ? { w: this.pxToSvg(this._nestingDims.w), h: this.pxToSvg(this._nestingDims.h) }
                : null;
        }
        return {
            strokeWidth: this.pxToSvg(STROKE_WIDTH),
            widgetDims: { w: this.pxToSvg(this.widgetDims.w), h: this.pxToSvg(this.widgetDims.h) },
            paramArgDims: this._argDims.map((dim, i) => ({
                param: this.paramDims[i]
                    ? {
                          w: this.pxToSvg(this.paramDims[i]!.w),
                          h: this.pxToSvg(this.paramDims[i]!.h),
                      }
                    : null,
                arg: dim ? { w: this.pxToSvg(dim.w), h: this.pxToSvg(dim.h) } : null,
            })),
            nestingDims,
            hasPrevNotch: this.hasConnectionPrev,
            hasNextNotch: this.hasConnectionNext,
        };
    }

    constructor(config: {
        id?: string;
        colorsDefault: { background: string; foreground: string; border: string };
        tooltipText: string;
        scaleLevel?: 1 | 2 | 3;
        widget: WidgetDisplay;
        params?: (string | null)[];
        argDims?: (Size | null)[];
        hasNesting?: boolean;
        nestingDims?: Size | null;
        hasConnectionPrev?: boolean;
        hasConnectionNext?: boolean;
        isNestingFolded?: boolean;
    }) {
        super(config);
        this.widget = config.widget;
        this.params = config.params ?? [];
        this.paramDims = this.params.map(() => null);
        this._argDims = config.argDims ?? (config.params ?? []).map(() => null);
        this.hasNesting = config.hasNesting ?? false;
        this._nestingDims = config.nestingDims ?? null;
        this.hasConnectionPrev = config.hasConnectionPrev ?? false;
        this.hasConnectionNext = config.hasConnectionNext ?? false;
        this.isNestingFolded = config.isNestingFolded ?? false;
    }
}

// ─────────────────────────────────────────────────────────────────────────────

/** Discriminated union over all brick model kinds; narrow via `kind`. */
export type BrickModel = ValueBrickModel | ExpressionBrickModel | StatementBrickModel;
