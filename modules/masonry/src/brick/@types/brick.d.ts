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
    strokeWidth: number; //remove
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
