/**
 * @type
 * Kind (instruction or argument) of a brick.
 */
export type TBrickKind = 'instruction' | 'argument';

/**
 * @type
 * Type (data, expression, statement, block) of a brick.
 */
export type TBrickType = 'data' | 'expression' | 'statement' | 'block';

/**
 * @type
 * Data type (boolean, number, string, any) returned by an argument brick.
 */
export type TBrickArgDataType = 'boolean' | 'number' | 'string' | 'any';

/**
 * @type
 * Bounding box dimensions of a brick.
 */
export type TBrickExtent = {
    width: number;
    height: number;
};

/**
 * @type
 * Position co-ordinates of a brick.
 */
export type TBrickCoords = {
    /** relative x co-ordinate */
    x: number;
    /** relative y co-ordinate */
    y: number;
};

/**
 * @type
 * Defines color property of a brick. Supported types are RGC, HSL, and hexadecimal.
 */
export type TBrickColor = ['rgb' | 'hsl', number, number, number] | string;

// -------------------------------------------------------------------------------------------------

/**
 * @interface
 * Style properties of a generic brick.
 */
export interface IBrickStyle {
    /** background color */
    colorBg: TBrickColor;
    /** foreground color */
    colorFg: TBrickColor;
    /** outline/stroke color */
    outline: TBrickColor;
    /** scale factor of the brick SVG */
    scale: number;
}

/**
 * @interface
 * Arguments for a brick.
 */
export interface IBrickArgs {
    /** map of argument ID to data associated with the argument */
    args: Record<
        string,
        {
            /** argument label */
            label: string;
            /** data type returned by the argument brick */
            dataType: TBrickArgDataType;
            /** metadata — reserved for future-proofing */
            meta: unknown;
        }
    >;
}

/**
 * @interface
 * State properties associated with bricks that can take arguments.
 */
export interface IBrickArgsState {
    /** map of argument ID to corresponding bounding box dimensions */
    get argsExtent(): Record<string, IBrickExtent>;
    /** map of argument ID to co-ordinates of the argument connections relative to the brick */
    get argsCoords(): Record<string, IBrickCoords>;
}

/**
 * @interface
 * Type definition of a generic brick (any type).
 */
export interface IBrick {
    /** unique ID of the brick */
    uuid: string;
    /** name of the brick — to be used for internal bookkeeping */
    name: string;
    /** kind of the brick */
    kind: TBrickKind;
    /** type of the brick */
    type: TBrickType;
    /** label for the brick */
    label: string;
    /** glyph icon associated with the brick */
    glyph: string;

    // states
    /** whether brick is highlighted */
    highlighted: boolean;
    /** bounding box dimensions of the brick */
    get extent(): IBrickExtent;

    /** SVG string for the brick based on defining properties and current state */
    get SVG(): string;
}

/**
 * @interface
 * Type definition of a generic argument brick (data or expression type).
 */
export interface IBrickArgument extends IBrick {
    /** data type returned by an argument brick */
    dataType: TBrickArgDataType;
}

/**
 * @interface
 * Type definition of a generic instruction brick (statement or block type).
 */
export interface IBrickInstruction extends IBrick {
    // style
    /** is connection allowed above the brick */
    connectAbove: boolean;
    /** is connection allowed below the brick */
    connectBelow: boolean;
}

/**
 * @interface
 * Type definition of a data brick.
 */
export interface IBrickData extends IBrickArgument {
    /** whether brick has a static label or value can be updated */
    dynamic: boolean;
    /** (if dynamic) current value of the brick */
    value?: boolean | number | string;
    /** (if dynamic) input mode for the brick (checkbox, number box, text box, dropdown, etc.) */
    input?: 'boolean' | 'number' | 'string' | 'options';
}

/**
 * @interface
 * Type definition of an argument brick.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IBrickExpression extends IBrickArgument {
    // reserving spot for future-proofing
}

/**
 * @interface
 * Type definition of a statement brick.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IBrickStatement extends IBrickInstruction {
    // reserving spot for future-proofing
}

/**
 * @interface
 * Type definition of a block brick.
 */
export interface IBrickBlock extends IBrickInstruction {
    // state
    /** combined bounding box of the instructions nested within the brick */
    get nestExtent(): IBrickExtent;
    /** whether brick nesting is hidden */
    collapsed: boolean;
}
