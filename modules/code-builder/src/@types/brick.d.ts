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
    get colorBg(): TBrickColor;
    /** foreground color */
    get colorFg(): TBrickColor;
    /** outline/stroke color */
    get outline(): TBrickColor;
    /** scale factor of the brick SVG */
    get scale(): number;
}

/**
 * @interface
 * Arguments for a brick.
 */
export interface IBrickArgs {
    /** map of argument ID to data associated with the argument */
    get args(): Record<
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
    /** Map of argument ID to corresponding extent and coords */
    get bBoxArgs(): Record<
        string,
        {
            /** Bounding box dimensions */
            extent: TBrickExtent;
            /** Co-ordinates of the argument connections relative to the brick */
            coords: TBrickCoords;
        }
    >;
}

/**
 * @interface
 * Type definition of a generic brick (any type).
 */
export interface IBrick extends IBrickStyle {
    /** unique ID of the brick */
    get uuid(): string;
    /** name of the brick — to be used for internal bookkeeping */
    get name(): string;
    /** kind of the brick */
    get kind(): TBrickKind;
    /** type of the brick */
    get type(): TBrickType;
    /** label for the brick */
    get label(): string;
    /** glyph icon associated with the brick */
    get glyph(): string;

    // states
    /** whether brick is highlighted */
    highlighted: boolean;
    /** Bounding box dimensions and coords of the brick */
    get bBoxBrick(): { extent: TBrickExtent; coords: TBrickCoords };

    /** SVG string for the brick based on defining properties and current state */
    get SVGpath(): string;
}

/**
 * @interface
 * Type definition of a generic argument brick (data or expression type).
 */
export interface IBrickArgument extends IBrick {
    /** data type returned by an argument brick */
    get dataType(): TBrickArgDataType;

    /** Bounding box dimensions and coords of the left notch */
    get bBoxNotchArg(): {
        /** Bounding box dimensions of the left notch */
        extent: TBrickExtent;
        /** Co-ordinates of the left notch relative to the brick */
        coords: TBrickCoords;
    };
}

/**
 * @interface
 * Type definition of a generic instruction brick (statement or block type).
 */
export interface IBrickInstruction extends IBrick, IBrickArgs, IBrickArgsState {
    // style
    /** is connection allowed above the brick */
    get connectAbove(): boolean;
    /** is connection allowed below the brick */
    get connectBelow(): boolean;

    /** Bounding box dimensions and coords of the top instruction notch */
    get bBoxNotchInsTop(): {
        /** Bounding box dimensions of the top instruction notch */
        extent: TBrickExtent;
        /** Co-ordinates of the top instruction notch relative to the brick */
        coords: TBrickCoords;
    };

    /** Bounding box dimensions and coords of the bottom instruction notch */
    get bBoxNotchInsBot(): {
        /** Bounding box dimensions of the bottom instruction notch */
        extent: TBrickExtent;
        /** Co-ordinates of the bottom instruction notch relative to the brick */
        coords: TBrickCoords;
    };
}

/**
 * @interface
 * Type definition of a data brick.
 */
export interface IBrickData extends IBrickArgument {
    /** whether brick has a static label or value can be updated */
    get dynamic(): boolean;
    /** (if dynamic) current value of the brick */
    get value(): undefined | boolean | number | string;
    /** (if dynamic) input mode for the brick (checkbox, number box, text box, dropdown, etc.) */
    get input(): undefined | 'boolean' | 'number' | 'string' | 'options';
}

/**
 * @interface
 * Type definition of an argument brick.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IBrickExpression extends IBrickArgument, IBrickArgs, IBrickArgsState {
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
export interface IBrickBlock extends IBrickInstruction, IBrickNotchInsNestTopState {
    // state
    /** combined bounding box of the instructions nested within the brick */
    get nestExtent(): TBrickExtent;
    /** whether brick nesting is hidden */
    collapsed: boolean;

    /** Bounding box dimensions and coords of the top instruction notch of the nesting */
    get bBoxNotchInsNestTop(): {
        /** Bounding box dimensions of the top instruction notch of the nesting */
        extent: TBrickExtent;
        /** Co-ordinates of the top instruction notch of the nesting relative to the brick */
        coords: TBrickCoords;
    };
}
