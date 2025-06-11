import type {
    IBrick,
    IBrickArgument,
    IBrickBlock,
    IBrickData,
    IBrickExpression,
    IBrickInstruction,
    IBrickStatement,
    TBrickRenderPropsData,
    TBrickRenderPropsExpression,
    TBrickRenderPropsStatement,
    TBrickRenderPropsBlock,
    TBrickKind,
    TBrickType,
    TColor,
    TCoords,
    TExtent,
} from '@/@types/brick';

/**
 * @abstract
 * @class
 * Defines the data model of a generic brick.
 */
abstract class BrickModel implements IBrick {
    protected _uuid: string;
    protected _name: string;
    protected _kind: TBrickKind;
    protected _type: TBrickType;

    protected _label: string;
    protected _glyph: string;
    protected _colorBg: TColor;
    protected _colorFg: TColor;
    protected _colorBgHighlight: TColor;
    protected _colorFgHighlight: TColor;
    protected _outline: TColor;

    protected _highlighted = false;
    protected _scale = 1;

    constructor(params: {
        /** unique ID */
        uuid: string;
        /** name — to be used for internal bookkeeping */
        name: string;
        /** kind — instruction or argument */
        kind: TBrickKind;
        /** type — data, expression, statement, or block */
        type: TBrickType;
        /** primary label */
        label: string;
        /** glyph icon associated with the brick */
        glyph?: string;
        /** primary background color */
        colorBg: TColor;
        /** primary foreground color */
        colorFg: TColor;
        /** highlighted state background color */
        colorBgHighlight: TColor;
        /** highlighted state foreground color */
        colorFgHighlight: TColor;
        /** outline/stroke color */
        outline: TColor;
    }) {
        this._uuid = params.uuid;
        this._name = params.name;
        this._kind = params.kind;
        this._type = params.type;

        this._label = params.label;
        this._glyph = params.glyph ?? '';
        this._colorBg = params.colorBg;
        this._colorFg = params.colorFg;
        this._colorBgHighlight = params.colorBgHighlight;
        this._colorFgHighlight = params.colorFgHighlight;
        this._outline = params.outline;
    }

    public get uuid(): string {
        return this._uuid;
    }

    public get name(): string {
        return this._name;
    }

    public get kind(): TBrickKind {
        return this._kind;
    }

    public get type(): TBrickType {
        return this._type;
    }

    public set highlighted(value: boolean) {
        this._highlighted = value;
    }

    public set scale(value: number) {
        this._scale = value;
    }

    public abstract get boundingBox(): TExtent;

    public abstract get connPointsFixed(): Record<string, { extent: TExtent; coords: TCoords }>;
}

/**
 * @abstract
 * @class
 * Defines the data model of a generic argument brick.
 */
abstract class BrickModelArgument extends BrickModel implements IBrickArgument {
    constructor(params: {
        uuid: string;
        name: string;
        type: TBrickType;

        label: string;
        glyph?: string;
        colorBg: TColor;
        colorFg: TColor;
        colorBgHighlight: TColor;
        colorFgHighlight: TColor;
        outline: TColor;
    }) {
        super({ ...params, kind: 'argument' });
    }

    public abstract get connPointsFixed(): Record<
        'argOutgoing',
        { extent: TExtent; coords: TCoords }
    >;
}

/**
 * @abstract
 * @class
 * Defines the data model of a generic instruction brick.
 */
abstract class BrickModelInstruction extends BrickModel implements IBrickInstruction {
    protected _connectAbove: boolean;
    protected _connectBelow: boolean;

    protected _args: { id: string; label: string }[] = [];

    constructor(params: {
        uuid: string;
        name: string;
        type: TBrickType;

        label: string;
        glyph?: string;
        colorBg: TColor;
        colorFg: TColor;
        colorBgHighlight: TColor;
        colorFgHighlight: TColor;
        outline: TColor;
        connectAbove: boolean;
        connectBelow: boolean;

        args: {
            /** unique identifier of the argument */
            id: string;
            /** label for the argument */
            label: string;
        }[];
    }) {
        super({ ...params, kind: 'instruction' });

        this._connectAbove = params.connectAbove;
        this._connectBelow = params.connectBelow;

        this._args = params.args;
    }

    public get connectAbove(): boolean {
        return this._connectAbove;
    }

    public get connectBelow(): boolean {
        return this._connectBelow;
    }

    public abstract get connPointsArg(): { [id: string]: { extent: TExtent; coords: TCoords } };

    public abstract setBoundingBoxArg(id: string, extent: TExtent): void;
}

/**
 * @abstract
 * @class
 * Defines the data model of a data brick.
 */
export abstract class BrickModelData extends BrickModelArgument implements IBrickData {
    protected _dynamic: boolean;
    protected _value?: boolean | number | string;
    protected _input?: 'boolean' | 'number' | 'string' | 'options';

    constructor(params: {
        uuid: string;
        name: string;

        label: string;
        glyph?: string;
        colorBg: TColor;
        colorFg: TColor;
        colorBgHighlight: TColor;
        colorFgHighlight: TColor;
        outline: TColor;

        dynamic: boolean;
        value?: boolean | number | string;
        input?: 'boolean' | 'number' | 'string' | 'options';
    }) {
        super({ ...params, type: 'data' });

        this._dynamic = params.dynamic;
        this._value = params.value;
        this._input = params.input;
    }

    public get dynamic(): boolean {
        return this._dynamic;
    }

    public get value(): boolean | number | string | undefined {
        return this._value;
    }

    public get input(): 'boolean' | 'number' | 'string' | 'options' | undefined {
        return this._input;
    }

    public abstract get renderProps(): TBrickRenderPropsData;
}

/**
 * @abstract
 * @class
 * Defines the data model of an expression brick.
 */
export abstract class BrickModelExpression extends BrickModelArgument implements IBrickExpression {
    protected _args: { id: string; label: string }[] = [];

    constructor(params: {
        uuid: string;
        name: string;

        label: string;
        glyph?: string;
        colorBg: TColor;
        colorFg: TColor;
        colorBgHighlight: TColor;
        colorFgHighlight: TColor;
        outline: TColor;

        args: {
            /** unique identifier of the argument */
            id: string;
            /** label for the argument */
            label: string;
        }[];
    }) {
        super({ ...params, type: 'expression' });

        this._args = params.args;
    }

    public abstract get connPointsArg(): { [id: string]: { extent: TExtent; coords: TCoords } };

    public abstract setBoundingBoxArg(id: string, extent: TExtent): void;

    public abstract get renderProps(): TBrickRenderPropsExpression;
}

/**
 * @abstract
 * @class
 * Defines the data model of a statement brick.
 */
export abstract class BrickModelStatement extends BrickModelInstruction implements IBrickStatement {
    constructor(params: {
        uuid: string;
        name: string;

        label: string;
        glyph: string;
        colorBg: TColor;
        colorFg: TColor;
        colorBgHighlight: TColor;
        colorFgHighlight: TColor;
        outline: TColor;
        connectAbove: boolean;
        connectBelow: boolean;

        args: {
            /** unique identifier of the argument */
            id: string;
            /** label for the argument */
            label: string;
        }[];
    }) {
        super({ ...params, type: 'statement' });
    }

    public abstract get connPointsFixed(): Record<
        'insTop' | 'insBottom',
        { extent: TExtent; coords: TCoords }
    >;

    public abstract get renderProps(): TBrickRenderPropsStatement;
}

/**
 * @abstract
 * @class
 * Defines the data model of a block brick.
 */
export abstract class BrickModelBlock extends BrickModelInstruction implements IBrickBlock {
    protected _folded = false;

    constructor(params: {
        uuid: string;
        name: string;

        label: string;
        glyph?: string;
        colorBg: TColor;
        colorFg: TColor;
        colorBgHighlight: TColor;
        colorFgHighlight: TColor;
        outline: TColor;
        connectAbove: boolean;
        connectBelow: boolean;

        args: {
            /** unique identifier of the argument */
            id: string;
            /** label for the argument */
            label: string;
        }[];
    }) {
        super({ ...params, type: 'block' });
    }

    public set folded(value: boolean) {
        this._folded = value;
    }

    public abstract get connPointsFixed(): Record<
        'insTop' | 'insBottom' | 'insNest',
        { extent: TExtent; coords: TCoords }
    >;

    public abstract get renderProps(): TBrickRenderPropsBlock;

    public abstract setBoundingBoxNest(extent: TExtent): void;
}
