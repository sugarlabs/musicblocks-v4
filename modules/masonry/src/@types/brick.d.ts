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
 * Bounding box dimensions of a brick.
 */
export type TExtent = {
    width: number;
    height: number;
};

/**
 * @type
 * Position co-ordinates of a brick.
 */
export type TCoords = {
    /** relative x co-ordinate */
    x: number;
    /** relative y co-ordinate */
    y: number;
};

/**
 * @type
 * Defines color property of a brick. Supported types are RGB, HSL, and hexadecimal.
 */
export type TColor = ['rgb' | 'hsl', number, number, number] | string;

// -------------------------------------------------------------------------------------------------

type TBrickRenderProps = {
    path: string;
    label: string;
    glyph: string;
    colorBg: TColor;
    colorFg: TColor;
    outline: TColor;
    scale: number;
};

export type TBrickRenderPropsData = TBrickRenderProps & {
    // reserving spot for future-proofing
};

export type TBrickRenderPropsExpression = TBrickRenderProps & {
    labelArgs: string[];
    boundingBoxArgs: TExtent[];
};

export type TBrickRenderPropsStatement = TBrickRenderProps & {
    labelArgs: string[];
    boundingBoxArgs: TExtent[];
};

export type TBrickRenderPropsBlock = TBrickRenderProps & {
    labelArgs: string[];
    boundingBoxArgs: TExtent[];
    boundingBoxNest: TExtent;
    folded: boolean;
};

// -------------------------------------------------------------------------------------------------

/**
 * @interface
 * Arguments for a brick.
 */
export interface IBrickArgs {
    /** list of argument connection points of the brick */
    get connPointsArg(): {
        [id: string]: {
            /** bounding box dimensions of the connection point */
            extent: TExtent;
            /** co-ordinates of the connection point */
            coords: TCoords;
        };
    };

    /**
     * Sets the bounding box extents for an arg
     * @param id arg identifier
     * @param extent width and height values of the arg
     */
    setBoundingBoxArg(id: string, extent: TExtent): void;
}

/**
 * @interface
 * Type definition of a generic brick (any type).
 */
export interface IBrick {
    /** unique ID of the brick */
    get uuid(): string;
    /** name of the brick — to be used for internal bookkeeping */
    get name(): string;
    /** kind of the brick */
    get kind(): TBrickKind;
    /** type of the brick */
    get type(): TBrickType;

    /** whether brick is highlighted */
    set highlighted(value: boolean);
    /** current vector scale factor */
    set scale(value: number);

    /** bounding box dimensions of the brick */
    get boundingBox(): TExtent;
    /** list of fixed connection points of the brick */
    get connPointsFixed(): Record<
        string,
        {
            /** bounding box dimensions of the connection point */
            extent: TExtent;
            /** co-ordinates of the connection point */
            coords: TCoords;
        }
    >;
}

/**
 * @interface
 * Type definition of a generic argument brick (data or expression type).
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IBrickArgument extends IBrick {
    // reserving spot for future-proofing
}

/**
 * @interface
 * Type definition of a generic instruction brick (statement or block type).
 */
export interface IBrickInstruction extends IBrick, IBrickArgs {
    /** is connection allowed above the brick */
    get connectAbove(): boolean;
    /** is connection allowed below the brick */
    get connectBelow(): boolean;
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

    /** list of properties required to render the data brick graphic */
    get renderProps(): IBrickRenderPropsData;
}

/**
 * @interface
 * Type definition of an argument brick.
 */
export interface IBrickExpression extends IBrickArgument, IBrickArgs, IBrickArgsState {
    /** list of properties required to render the expression brick graphic */
    get renderProps(): IBrickRenderPropsExpression;
}

/**
 * @interface
 * Type definition of a statement brick.
 */
export interface IBrickStatement extends IBrickInstruction {
    /** list of properties required to render the statement brick graphic */
    get renderProps(): IBrickRenderPropsStatement;
}

/**
 * @interface
 * Type definition of a block brick.
 */
export interface IBrickBlock extends IBrickInstruction, IBrickNotchInsNestTopState {
    /** whether brick nesting is hidden */
    set folded(value: boolean);

    /** list of properties required to render the block brick graphic */
    get renderProps(): IBrickRenderPropsBlock;

    /**
     * Sets the bounding box extents for the nested area
     * @param extent width and height values of the nest area
     */
    setBoundingBoxNest(extent: TExtent): void;

    get connPointsFixed(): Record<
        'insTop' | 'insBottom' | 'insNest',
        { extent: TExtent; coords: TCoords }
    >;
}
