import type {
    IBrick,
    IBrickSimple,
    IBrickExpression,
    IBrickCompound,
    TBrickType,
    TExtent,
    TColor,
    TVisualState,
    TBrickRenderProps,
    TBrickRenderPropsSimple,
    TBrickRenderPropsExpression,
    TBrickRenderPropsCompound,
} from '../@types/brick';
/**
 * @abstract
 * @class
 * Defines the data model of a generic brick.
 */
export abstract class BrickModel implements IBrick {
    protected _uuid: string;
    protected _name: string;
    protected _type: TBrickType;
    protected _scale: number;

    // View/render props
    protected _label: string;
    protected _labelType: 'text' | 'glyph' | 'icon' | 'thumbnail';
    protected _colorBg: TColor;
    protected _colorFg: TColor;
    protected _strokeColor: TColor;
    protected _strokeWidth = 1;
    protected _shadow: boolean;
    protected _tooltip?: string;

    protected _bboxArgs: TExtent[] = [];

    // State flags
    protected _visualState: TVisualState = 'default';
    protected _isActionMenuOpen: boolean = false;
    protected _isVisible: boolean = true;

    constructor(params: {
        uuid: string;
        name: string;
        type: TBrickType;
        scale: number;

        label: string;
        labelType: 'text' | 'glyph' | 'icon' | 'thumbnail';
        colorBg: TColor;
        colorFg: TColor;
        strokeColor: TColor;
        shadow: boolean;
        tooltip?: string;
    }) {
        this._uuid = params.uuid;
        this._name = params.name;
        this._type = params.type;
        this._scale = params.scale;

        this._label = params.label;
        this._colorBg = params.colorBg;
        this._colorFg = params.colorFg;
        this._labelType = params.labelType;
        this._strokeColor = params.strokeColor;
        this._shadow = params.shadow;
        this._tooltip = params.tooltip;
    }

    public get uuid(): string {
        return this._uuid;
    }

    public get name(): string {
        return this._name;
    }

    public get type(): TBrickType {
        return this._type;
    }

    public set scale(value: number) {
        this._scale = value;
    }

    public get visualState(): TVisualState {
        return this._visualState;
    }
    public set visualState(value: TVisualState) {
        this._visualState = value;
    }

    public get isActionMenuOpen(): boolean {
        return this._isActionMenuOpen;
    }
    public set isActionMenuOpen(value: boolean) {
        this._isActionMenuOpen = value;
    }

    public get isVisible(): boolean {
        return this._isVisible;
    }
    public set isVisible(value: boolean) {
        this._isVisible = value;
    }

    // Abstract method that subclasses must define
    public abstract get boundingBox(): TExtent;

    protected getCommonRenderProps(): TBrickRenderProps {
        return {
            path: 'string',
            label: this._label,
            labelType: this._labelType,
            colorBg: this._colorBg,
            colorFg: this._colorFg,
            strokeColor: this._strokeColor,
            strokeWidth: this._strokeWidth,
            scale: this._scale,
            shadow: this._shadow,
            tooltip: this._tooltip,
            bboxArgs: this._bboxArgs,
            visualState: this._visualState,
            isActionMenuOpen: this._isActionMenuOpen,
            isVisible: this._isVisible,
        };
    }
}

/**
 * @abstract
 * @class
 * Defines the model logic for an Expression brick.
 */
export abstract class BrickModelExpression extends BrickModel implements IBrickExpression {
    protected _isValueSelectOpen: boolean = false;
    /** Defines the type of Value */
    protected _value: boolean | number | string | undefined;

    constructor(params: {
        uuid: string;
        name: string;
        label: string;
        labelType: 'text' | 'glyph' | 'icon' | 'thumbnail';
        colorBg: TColor;
        colorFg: TColor;
        strokeColor: TColor;
        shadow: boolean;
        scale: number;
        tooltip?: string;
        hasContextMenu?: boolean;

        value?: boolean | number | string | undefined;
        isValueSelectOpen?: boolean;
        bboxArgs: TExtent[];
    }) {
        super({
            ...params,
            type: 'Expression' as TBrickType,
        });
        this._value = params.value;
        this._isValueSelectOpen = params.isValueSelectOpen ?? false;
        this._bboxArgs = params.bboxArgs;
    }

    public get value(): boolean | number | string | undefined {
        return this._value;
    }

    public get isValueSelectOpen(): boolean {
        return this._isValueSelectOpen;
    }

    public get renderProps(): TBrickRenderPropsExpression {
        return {
            ...this.getCommonRenderProps(),
            isValueSelectOpen: this._isValueSelectOpen,
            value: this._value,
        };
    }
}

/**
 * @abstract
 * @class
 * Defines the model logic for a Simple Statement brick.
 */
export abstract class BrickModelSimple extends BrickModel implements IBrickSimple {
    /** Whether the top notch (connector) is present */
    protected _topNotch: boolean;

    /** Whether the bottom notch (connector) is present */
    protected _bottomNotch: boolean;

    /**
     * @param
     */
    constructor(params: {
        uuid: string;
        name: string;
        label: string;
        labelType: 'text' | 'glyph' | 'icon' | 'thumbnail';
        colorBg: TColor;
        colorFg: TColor;
        strokeColor: TColor;
        shadow: boolean;
        isHighlighted: boolean;
        tooltip?: string;
        scale: number;

        topNotch: boolean;
        bottomNotch: boolean;
        bboxArgs: TExtent[];
    }) {
        super({
            ...params,
            type: 'Simple' as TBrickType,
        });

        this._topNotch = params.topNotch;
        this._bottomNotch = params.bottomNotch;
        this._bboxArgs = params.bboxArgs;
    }

    /** Top connector for stacking or inserting above */
    public get topNotch(): boolean {
        return this._topNotch;
    }

    /** Bottom connector for stacking or inserting below */
    public get bottomNotch(): boolean {
        return this._bottomNotch;
    }

    public get renderProps(): TBrickRenderPropsSimple {
        return {
            ...this.getCommonRenderProps(),
            topNotch: this._topNotch,
            bottomNotch: this._bottomNotch,
        };
    }
}

/**
 * @abstract
 * @class
 * Defines the shared model logic for a Compound (nesting) statement brick.
 */
export abstract class BrickModelCompound extends BrickModel implements IBrickCompound {
    /** Whether a connector notch is shown on top (for stacking) */
    protected _topNotch: boolean;

    /** Whether a connector notch is shown on bottom (for stacking) */
    protected _bottomNotch: boolean;

    /** Bounding‐box for the nested area */
    protected _bboxNest: TExtent[] = [];

    /** Folded/collapsed state of the nested area */
    protected _isFolded: boolean = false;

    constructor(params: {
        uuid: string;
        name: string;
        label: string;
        labelType: 'text' | 'glyph' | 'icon' | 'thumbnail';
        colorBg: TColor;
        colorFg: TColor;
        strokeColor: TColor;
        shadow: boolean;
        isHighlighted: boolean;
        tooltip?: string;
        scale: number;

        topNotch: boolean;
        bottomNotch: boolean;
        bboxArgs: TExtent[];
        bboxNest: TExtent[];
    }) {
        super({
            ...params,
            type: 'Compound' as TBrickType,
        });

        this._topNotch = params.topNotch;
        this._bottomNotch = params.bottomNotch;
        this._bboxNest = params.bboxNest;
    }

    /** @inheritdoc IBrickCompound.topNotch */
    public get topNotch(): boolean {
        return this._topNotch;
    }

    /** @inheritdoc IBrickCompound.bottomNotch */
    public get bottomNotch(): boolean {
        return this._bottomNotch;
    }

    /** @inheritdoc IBrickCompound.isFolded */
    public set isFolded(value: boolean) {
        this._isFolded = value;
    }

    public get bboxNest(): TExtent[] {
        return this._bboxNest;
    }

    /** @inheritdoc IBrickCompound.setBoundingBoxNest */
    public setBoundingBoxNest(extents: TExtent[]): void {
        this._bboxNest = extents;
    }

    /**
     * @inheritdoc IBrickCompound.renderProps
     * Concrete subclasses must return:
     *  - path, colors (highlight vs default)
     *  - labelArgs, boundingBoxArgs, boundingBoxNest, TopNotch/BottomNotch
     */
    public get renderProps(): TBrickRenderPropsCompound {
        return {
            ...this.getCommonRenderProps(),
            topNotch: this._topNotch,
            bottomNotch: this._bottomNotch,
            bboxNest: this._bboxNest,
            isFolded: this._isFolded,
        };
    }
}
