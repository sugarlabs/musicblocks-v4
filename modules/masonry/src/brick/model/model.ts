import type {
    IBrick,
    TBrickType,
    TExtent,
    TColor,
    TVisualState,
    TBrickRenderProps,
    IBrickSimple,
    TBrickRenderPropsSimple,
    IBrickExpression,
    TBrickRenderPropsExpression,
    IBrickCompound,
    TBrickRenderPropsCompound,
} from '../@types/brick';
import type { TConnectionPoints as TCP } from '../../tree/model/model';
import { generateBrickData } from '../utils/path';
import type { TInputUnion } from '../utils/path';

// Text measurement utility
function measureTextWidth(text: string, fontSize: number = 16): number {
    // Create a canvas element for text measurement
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    context.font = `${fontSize}px sans-serif`;
    return context.measureText(text).width;
}

// Fallback for server-side rendering or when canvas is not available
function estimateTextWidth(text: string): number {
    return Math.max(text.length * 8, 40); // Minimum width of 40
}

function getLabelWidth(label: string): number {
    try {
        return measureTextWidth(label, 16) + 8; // Add 8px padding
    } catch {
        return estimateTextWidth(label);
    }
}

export abstract class BrickModel implements IBrick {
    protected _uuid: string;
    protected _name: string;
    protected _type: TBrickType;
    protected _scale: number;
    protected _label: string;
    protected _labelType: 'text' | 'glyph' | 'icon' | 'thumbnail';
    protected _colorBg: TColor;
    protected _colorFg: TColor;
    protected _strokeColor: TColor;
    protected _strokeWidth = 1;
    protected _shadow: boolean;
    protected _tooltip?: string;
    protected _bboxArgs: TExtent[] = [];
    protected _visualState: TVisualState = 'default';
    protected _isActionMenuOpen = false;
    protected _isVisible = true;

    protected _connectionPoints: TCP = { right: [] };
    protected _boundingBox: TExtent = { w: 0, h: 0 };

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
        bboxArgs: TExtent[];
    }) {
        this._uuid = params.uuid;
        this._name = params.name;
        this._type = params.type;
        this._scale = params.scale;
        this._label = params.label;
        this._labelType = params.labelType;
        this._colorBg = params.colorBg;
        this._colorFg = params.colorFg;
        this._strokeColor = params.strokeColor;
        this._shadow = params.shadow;
        this._tooltip = params.tooltip;
        this._bboxArgs = params.bboxArgs;

        this.boundingBox = { w: 0, h: 0 };
        this.connectionPoints = { right: [] };
    }

    get uuid() {
        return this._uuid;
    }
    get name() {
        return this._name;
    }
    get type() {
        return this._type;
    }
    set scale(value: number) {
        this._scale = value;
    }
    get visualState() {
        return this._visualState;
    }
    set visualState(value: TVisualState) {
        this._visualState = value;
    }
    get isActionMenuOpen() {
        return this._isActionMenuOpen;
    }
    set isActionMenuOpen(value: boolean) {
        this._isActionMenuOpen = value;
    }
    get isVisible() {
        return this._isVisible;
    }
    set isVisible(value: boolean) {
        this._isVisible = value;
    }

    public get boundingBox(): TExtent {
        return this._boundingBox;
    }
    public set boundingBox(box: TExtent) {
        this._boundingBox = box;
    }

    public get connectionPoints(): TCP {
        return this._connectionPoints;
    }
    public set connectionPoints(points: TCP) {
        this._connectionPoints = points;
    }

    protected getCommonRenderProps(): TBrickRenderProps {
        return {
            path: '',
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

    /** Must assemble the full render props for this brick. */
    public abstract get renderProps(): TBrickRenderProps;

    /** Must update geometry when label or other properties change. */
    public abstract updateGeometry(): void;

    get label(): string {
        return this._label;
    }

    set label(value: string) {
        this._label = value;
        this.updateGeometry();
    }

    get labelType(): 'text' | 'glyph' | 'icon' | 'thumbnail' {
        return this._labelType;
    }
}

/**
 * @class
 * Final concrete class for Simple-statement bricks.
 */
export class SimpleBrick extends BrickModel implements IBrickSimple {
    private _topNotch: boolean;
    private _bottomNotch: boolean;

    constructor(params: {
        uuid: string;
        name: string;
        label: string;
        labelType: 'text' | 'glyph' | 'icon' | 'thumbnail';
        colorBg: TColor;
        colorFg: TColor;
        strokeColor: TColor;
        shadow: boolean;
        tooltip?: string;
        scale: number;
        bboxArgs: TExtent[];
        topNotch: boolean;
        bottomNotch: boolean;
    }) {
        super({
            uuid: params.uuid,
            name: params.name,
            type: 'Simple',
            scale: params.scale,
            label: params.label,
            labelType: params.labelType,
            colorBg: params.colorBg,
            colorFg: params.colorFg,
            strokeColor: params.strokeColor,
            shadow: params.shadow,
            tooltip: params.tooltip,
            bboxArgs: params.bboxArgs,
        });

        this._topNotch = params.topNotch;
        this._bottomNotch = params.bottomNotch;
        this.updateGeometry();
    }

    public updateGeometry() {
        const config: TInputUnion = {
            type: 'type1',
            strokeWidth: this._strokeWidth,
            scaleFactor: this._scale,
            bBoxLabel: { w: getLabelWidth(this._label), h: 20 },
            bBoxArgs: this._bboxArgs,
            hasNotchAbove: this._topNotch,
            hasNotchBelow: this._bottomNotch,
        };
        const data = generateBrickData(config);
        this.connectionPoints = data.connectionPoints;
        this.boundingBox = data.boundingBox;
    }

    public get topNotch(): boolean {
        return this._topNotch;
    }
    public get bottomNotch(): boolean {
        return this._bottomNotch;
    }

    public override get renderProps(): TBrickRenderPropsSimple {
        return {
            ...this.getCommonRenderProps(),
            topNotch: this._topNotch,
            bottomNotch: this._bottomNotch,
        };
    }
}

/**
 * @class
 * Final concrete class for Expression bricks.
 */
export class ExpressionBrick extends BrickModel implements IBrickExpression {
    private _value?: boolean | number | string;
    private _isValueSelectOpen: boolean;

    constructor(params: {
        uuid: string;
        name: string;
        label: string;
        labelType: 'text' | 'glyph' | 'icon' | 'thumbnail';
        colorBg: TColor;
        colorFg: TColor;
        strokeColor: TColor;
        shadow: boolean;
        tooltip?: string;
        scale: number;
        bboxArgs: TExtent[];
        value?: boolean | number | string;
        isValueSelectOpen?: boolean;
    }) {
        super({
            uuid: params.uuid,
            name: params.name,
            type: 'Expression',
            scale: params.scale,
            label: params.label,
            labelType: params.labelType,
            colorBg: params.colorBg,
            colorFg: params.colorFg,
            strokeColor: params.strokeColor,
            shadow: params.shadow,
            tooltip: params.tooltip,
            bboxArgs: params.bboxArgs,
        });

        this._value = params.value;
        this._isValueSelectOpen = params.isValueSelectOpen || false;
        this.updateGeometry();
    }

    public updateGeometry() {
        const config: TInputUnion = {
            type: 'type2',
            strokeWidth: this._strokeWidth,
            scaleFactor: this._scale,
            bBoxLabel: { w: getLabelWidth(this._label), h: 20 },
            bBoxArgs: this._bboxArgs,
        };
        const data = generateBrickData(config);
        this.connectionPoints = data.connectionPoints;
        this.boundingBox = data.boundingBox;
    }

    public get value(): boolean | number | string | undefined {
        return this._value;
    }
    public get isValueSelectOpen(): boolean {
        return this._isValueSelectOpen;
    }
    public set isValueSelectOpen(open: boolean) {
        this._isValueSelectOpen = open;
    }

    public override get renderProps(): TBrickRenderPropsExpression {
        return {
            ...this.getCommonRenderProps(),
            value: this._value,
            isValueSelectOpen: this._isValueSelectOpen,
        };
    }
}

/**
 * @class
 * Final concrete class for Compound-statement bricks.
 */
export default class CompoundBrick extends BrickModel implements IBrickCompound {
    private _topNotch: boolean;
    private _bottomNotch: boolean;
    private _isFolded: boolean;
    private _bboxNest: TExtent[];

    constructor(params: {
        uuid: string;
        name: string;
        label: string;
        labelType: 'text' | 'glyph' | 'icon' | 'thumbnail';
        colorBg: TColor;
        colorFg: TColor;
        strokeColor: TColor;
        shadow: boolean;
        tooltip?: string;
        scale: number;
        bboxArgs: TExtent[];
        bboxNest: TExtent[];
        isFolded?: boolean;
        topNotch: boolean;
        bottomNotch: boolean;
    }) {
        super({
            uuid: params.uuid,
            name: params.name,
            type: 'Compound',
            scale: params.scale,
            label: params.label,
            labelType: params.labelType,
            colorBg: params.colorBg,
            colorFg: params.colorFg,
            strokeColor: params.strokeColor,
            shadow: params.shadow,
            tooltip: params.tooltip,
            bboxArgs: params.bboxArgs,
        });

        this._topNotch = params.topNotch;
        this._bottomNotch = params.bottomNotch;
        this._bboxNest = params.bboxNest;
        this._isFolded = params.isFolded || false;
        this.updateGeometry();
    }

    public updateGeometry() {
        const config: TInputUnion = {
            type: 'type3',
            strokeWidth: this._strokeWidth,
            scaleFactor: this._scale,
            bBoxLabel: { w: getLabelWidth(this._label), h: 20 },
            bBoxArgs: this._bboxArgs,
            hasNotchAbove: this._topNotch,
            hasNotchBelow: this._bottomNotch,
            bBoxNesting: this._bboxNest,
            secondaryLabel: true,
        };
        const data = generateBrickData(config);
        this.connectionPoints = data.connectionPoints;
        this.boundingBox = data.boundingBox;
    }

    public get topNotch(): boolean {
        return this._topNotch;
    }
    public get bottomNotch(): boolean {
        return this._bottomNotch;
    }
    public get bboxNest(): TExtent[] {
        return this._bboxNest;
    }
    public get isFolded(): boolean {
        return this._isFolded;
    }
    public set isFolded(v: boolean) {
        this._isFolded = v;
    }
    public setBoundingBoxNest(extents: TExtent[]): void {
        this._bboxNest = extents;
    }

    /**
     * Recursively update bounding box and connection points to fit nested children.
     * Call this after all children are attached, before rendering.
     */
    public updateLayoutWithChildren(nestedChildren: BrickModel[]): void {
        // If there are nested children, calculate the total bounding box
        if (nestedChildren && nestedChildren.length > 0) {
            // Calculate the bounding box that fits all nested children
            let _minX = 0,
                _minY = 0,
                maxX = 0,
                maxY = 0;
            nestedChildren.forEach((child) => {
                const bbox = child.boundingBox;
                // For simplicity, assume children are stacked vertically for now
                maxY += bbox.h;
                maxX = Math.max(maxX, bbox.w);
            });
            // Expand this brick's bboxNest to fit the children
            this._bboxNest = [{ w: maxX, h: maxY }];
        } else {
            this._bboxNest = [];
        }
        // Update geometry with new bboxNest
        this.updateGeometry();
    }

    public override get renderProps(): TBrickRenderPropsCompound {
        return {
            ...this.getCommonRenderProps(),
            topNotch: this._topNotch,
            bottomNotch: this._bottomNotch,
            bboxNest: this._bboxNest,
            isFolded: this._isFolded,
        };
    }
}
