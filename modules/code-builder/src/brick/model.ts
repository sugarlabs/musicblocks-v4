import type {
    IBrick,
    IBrickArgument,
    IBrickBlock,
    IBrickData,
    IBrickExpression,
    IBrickInstruction,
    IBrickStatement,
    TBrickArgDataType,
    TBrickColor,
    TBrickCoords,
    TBrickExtent,
    TBrickKind,
    TBrickType,
} from '@/@types/brick';

// -- protected classes ------------------------------------------------------------------------------

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

    protected _colorBg: TBrickColor;
    protected _colorFg: TBrickColor;
    protected _outline: TBrickColor;
    protected _scale: number;

    public highlighted = false;

    constructor(params: {
        // intrinsic
        name: string;
        kind: TBrickKind;
        type: TBrickType;
        label: string;
        glyph: string;
        // style
        colorBg: TBrickColor;
        colorFg: TBrickColor;
        outline: TBrickColor;
        scale: number;
    }) {
        this._uuid = '';
        this._name = params.name;
        this._kind = params.kind;
        this._type = params.type;
        this._label = params.label;
        this._glyph = params.glyph;
        this._colorBg = params.colorBg;
        this._colorFg = params.colorFg;
        this._outline = params.outline;
        this._scale = params.scale;
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

    public get label(): string {
        return this._label;
    }

    public get glyph(): string {
        return this._glyph;
    }

    public get colorBg(): TBrickColor {
        return this.colorBg;
    }

    public get colorFg(): TBrickColor {
        return this.colorFg;
    }

    public get outline(): TBrickColor {
        return this.outline;
    }

    public get scale(): number {
        return this.scale;
    }

    public abstract get extent(): TBrickExtent;

    public abstract get SVG(): string;
}

/**
 * @abstract
 * @class
 * Defines the data model of a generic argument brick.
 */
abstract class BrickModelArgument extends BrickModel implements IBrickArgument {
    protected _dataType: TBrickArgDataType;

    constructor(params: {
        // intrinsic
        name: string;
        type: TBrickType;
        label: string;
        glyph: string;
        dataType: TBrickArgDataType;
        // style
        colorBg: TBrickColor;
        colorFg: TBrickColor;
        outline: TBrickColor;
        scale: number;
    }) {
        super({ ...params, kind: 'argument' });

        this._dataType = params.dataType;
    }

    public get dataType(): TBrickArgDataType {
        return this._dataType;
    }
}

/**
 * @abstract
 * @class
 * Defines the data model of a generic instruction brick.
 */
abstract class BrickModelInstruction extends BrickModel implements IBrickInstruction {
    protected _args: Record<
        string,
        {
            label: string;
            dataType: TBrickArgDataType;
            meta: unknown;
        }
    >;

    protected _connectAbove: boolean;
    protected _connectBelow: boolean;

    public argsExtent: Record<string, TBrickExtent> = {};

    constructor(params: {
        // intrinsic
        name: string;
        type: TBrickType;
        label: string;
        glyph: string;
        args: Record<
            string,
            {
                label: string;
                dataType: TBrickArgDataType;
                meta: unknown;
            }
        >;
        // style
        colorBg: TBrickColor;
        colorFg: TBrickColor;
        outline: TBrickColor;
        scale: number;
        connectAbove: boolean;
        connectBelow: boolean;
    }) {
        super({ ...params, kind: 'instruction' });

        this._args = params.args;
        this._connectAbove = params.connectAbove;
        this._connectBelow = params.connectBelow;
    }

    public get args(): Record<
        string,
        {
            label: string;
            dataType: TBrickArgDataType;
            meta: unknown;
        }
    > {
        return this._args;
    }

    public get connectAbove(): boolean {
        return this._connectAbove;
    }

    public get connectBelow(): boolean {
        return this._connectBelow;
    }

    public abstract get argsCoords(): Record<string, TBrickCoords>;
}

// -- public classes -------------------------------------------------------------------------------

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
        // intrinsic
        name: string;
        label: string;
        glyph: string;
        dataType: TBrickArgDataType;
        dynamic: boolean;
        value?: boolean | number | string;
        input?: 'boolean' | 'number' | 'string' | 'options';
        // style
        colorBg: TBrickColor;
        colorFg: TBrickColor;
        outline: TBrickColor;
        scale: number;
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
}

/**
 * @abstract
 * @class
 * Defines the data model of an expression brick.
 */
export abstract class BrickModelExpression extends BrickModelArgument implements IBrickExpression {
    protected _args: Record<
        string,
        {
            label: string;
            dataType: TBrickArgDataType;
            meta: unknown;
        }
    >;

    public argsExtent: Record<string, TBrickExtent> = {};

    constructor(params: {
        // intrinsic
        name: string;
        label: string;
        glyph: string;
        dataType: TBrickArgDataType;
        args: Record<
            string,
            {
                label: string;
                dataType: TBrickArgDataType;
                meta: unknown;
            }
        >;
        // style
        colorBg: TBrickColor;
        colorFg: TBrickColor;
        outline: TBrickColor;
        scale: number;
    }) {
        super({ ...params, type: 'expression' });

        this._args = params.args;
    }

    public get args(): Record<
        string,
        {
            label: string;
            dataType: TBrickArgDataType;
            meta: unknown;
        }
    > {
        return this._args;
    }

    public abstract get argsCoords(): Record<string, TBrickCoords>;
}

/**
 * @abstract
 * @class
 * Defines the data model of a statement brick.
 */
export abstract class BrickModelStatement extends BrickModelInstruction implements IBrickStatement {
    constructor(params: {
        // intrinsic
        name: string;
        label: string;
        glyph: string;
        args: Record<
            string,
            {
                label: string;
                dataType: TBrickArgDataType;
                meta: unknown;
            }
        >;
        // style
        colorBg: TBrickColor;
        colorFg: TBrickColor;
        outline: TBrickColor;
        scale: number;
        connectAbove: boolean;
        connectBelow: boolean;
    }) {
        super({ ...params, type: 'statement' });
    }
}

/**
 * @abstract
 * @class
 * Defines the data model of a block brick.
 */
export abstract class BrickModelBlock extends BrickModelInstruction implements IBrickBlock {
    public nestExtent: TBrickExtent = { width: 0, height: 0 };
    public collapsed = false;

    constructor(params: {
        // intrinsic
        name: string;
        label: string;
        glyph: string;
        args: Record<
            string,
            {
                label: string;
                dataType: TBrickArgDataType;
                meta: unknown;
            }
        >;
        // style
        colorBg: TBrickColor;
        colorFg: TBrickColor;
        outline: TBrickColor;
        scale: number;
        connectAbove: boolean;
        connectBelow: boolean;
    }) {
        super({ ...params, type: 'block' });
    }
}
