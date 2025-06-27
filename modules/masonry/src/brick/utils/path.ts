type TBBox = { w: number; h: number };
export type TInputUnion = TInputType1 | TInputType2 | TInputType3;

// Type definitions for input configurations
type TInputCommon = {
    strokeWidth: number;
    scaleFactor: number;
    bBoxLabel: TBBox;
    bBoxArgs: TBBox[];
};

type TInputType1 = TInputCommon & {
    type: 'type1';
    hasNotchAbove: boolean;
    hasNotchBelow: boolean;
};

type TInputType2 = TInputCommon & {
    type: 'type2';
};

type TInputType3 = TInputCommon & {
    type: 'type3';
    hasNotchAbove: boolean;
    hasNotchBelow: boolean;
    bBoxNesting: TBBox[];
    secondaryLabel: boolean;
};

// -----------------Constants------------------------

const CORNER_RADIUS = 4;
const OFFSET_NOTCH_TOP = 4;
const OFFSET_NOTCH_RIGHT = 4;
const WIDTH_NOTCH_TOP = 10;
const HEIGHT_NOTCH_RIGHT = 12;
const OFFSET_NOTCH_BOTTOM = 4;
const WIDTH_NOTCH_BOTTOM = 10;
const OUTER_CORNER_RADIUS = 5;
const CONN_NOTCH_WIDTH = 12;
const MIN_NESTED_HEIGHT = 40;
const MIN_LABEL_WIDTH = 40;
const MIN_LABEL_HEIGHT = 20;

// ------------------Notch generations-----------------------------

// function for Top Notch generation
function _generateNotchTop(): string[] {
    return [
        //,
        'v 2',
        'h 10',
        'v -2',
    ];
}

// function for Bottom Notch generation
function _generateNotchBottom(_strokeWidth: number): string[] {
    return [
        //,
        'h -1',
        `v 2`,
        `h -8`,
        `v -2`,
        'h -1',
    ];
}

// function for Left Notch generation
function _generateNotchLeft(): string[] {
    return ['v -5', 'h -6', 'v 3', 'h -2', 'v -8', 'h 2', 'v 3', 'h 6', 'v -5'];
}

// function for Right Notch generation
function _generateNotchRight(): string[] {
    return ['v 4', 'h -4', 'v -3', 'h -4', 'v 10', 'h 4', 'v -3', 'h 4', 'v 4'];
}

// -----------------------Path Generation------------------------------

// function to generate the top part of the svg
let variableTopWidth = 0;
function _generateTop(config: {
    type: string;
    hasNotch: boolean;
    hasArgs: boolean;
    strokeWidth: number;
    bBoxLabel: TBBox;
}): string[] {
    const { type: _type, hasNotch, strokeWidth, bBoxLabel, hasArgs } = config;

    // Corner Radius + Offset + Notch + Variable width + Corner Radius = Stroke Width/2 + LabelBounding Box width + Stroke Width/2
    if (hasArgs) {
        variableTopWidth =
            strokeWidth / 2 +
            Math.max(MIN_LABEL_WIDTH, bBoxLabel.w) +
            strokeWidth / 2 -
            CORNER_RADIUS -
            WIDTH_NOTCH_TOP -
            OFFSET_NOTCH_TOP -
            CORNER_RADIUS;
    } else {
        variableTopWidth =
            strokeWidth / 2 +
            Math.max(MIN_LABEL_WIDTH, bBoxLabel.w) +
            strokeWidth / 2 -
            CORNER_RADIUS -
            WIDTH_NOTCH_TOP -
            OFFSET_NOTCH_TOP -
            CORNER_RADIUS;
    }

    return [
        //
        `a ${CORNER_RADIUS} ${CORNER_RADIUS} 90 0 1 ${CORNER_RADIUS} -${CORNER_RADIUS}`,
        `h ${OFFSET_NOTCH_TOP}`,
        ...(hasNotch ? _generateNotchTop() : [`h ${WIDTH_NOTCH_TOP}`]),
        `h ${variableTopWidth}`,
        // Only include OFFSET_NOTCH_RIGHT when there are args
        ...(hasArgs ? [`h ${OFFSET_NOTCH_RIGHT}`] : []),
    ];
}

// function to generate the right part of the svg
function _generateRight(config: {
    hasArgs: boolean;
    strokeWidth: number;
    bBoxLabel: TBBox;
    bBoxArgs: TBBox[];
}): { path: string[]; vertical: number } {
    const { hasArgs, strokeWidth, bBoxLabel, bBoxArgs } = config;

    const path: string[] = [];
    let vertical = 0;

    path.push(`a ${CORNER_RADIUS} ${CORNER_RADIUS} 90 0 1 ${CORNER_RADIUS} ${CORNER_RADIUS}`);
    vertical += CORNER_RADIUS;

    if (hasArgs) {
        const requiredMinimum =
            strokeWidth / 2 + Math.max(MIN_LABEL_HEIGHT, bBoxLabel.h) + strokeWidth / 2;
        const argHeightsSum = bBoxArgs.length > 0 ? bBoxArgs.reduce((sum, arg) => sum + arg.h, 0) : 0;
        const extra = Math.max(0, requiredMinimum - argHeightsSum);

        for (let i = 0; i < bBoxArgs.length; i++) {
            const argBox = bBoxArgs[i];

            const fixedNotchHeight =
                strokeWidth / 2 +
                CORNER_RADIUS +
                HEIGHT_NOTCH_RIGHT +
                CORNER_RADIUS +
                strokeWidth / 2;
            const connectingBrickTransitions = CORNER_RADIUS + strokeWidth + CORNER_RADIUS;
            const totalFixedHeight = fixedNotchHeight + connectingBrickTransitions;

            const extraPerArg = extra / bBoxArgs.length;
            const totalRequiredForThisArg = argBox.h + extraPerArg;
            const variableLength = Math.max(0, totalRequiredForThisArg - totalFixedHeight);

            const notchPath = _generateNotchRight();
            path.push(...notchPath);
            vertical += 4 + -3 + 10 + -3 + 4; // from notch path

            if (variableLength > 0) {
                path.push(`v ${variableLength.toFixed(2)}`);
                vertical += variableLength;
            }

            if (i < bBoxArgs.length - 1) {
                path.push(`v ${CORNER_RADIUS}`);
                path.push(`v ${strokeWidth}`);
                path.push(`v ${CORNER_RADIUS}`);
                vertical += CORNER_RADIUS + strokeWidth + CORNER_RADIUS;
            }
        }
    } else {
        const totalHeight =
            strokeWidth / 2 + Math.max(MIN_LABEL_HEIGHT, bBoxLabel.h) + strokeWidth / 2;
        const rightEdge = Math.max(totalHeight - CORNER_RADIUS * 2, HEIGHT_NOTCH_RIGHT);
        path.push(`v ${rightEdge.toFixed(2)}`);
        vertical += rightEdge;
    }

    return { path, vertical };
}

// function to generate the left part of the svg
function _generateLeft(config: {
    type: string;
    hasNotch: boolean;
    strokeWidth: number;
    rightVertical: number;
}): { path: string[]; leftEdge: number } {
    const { type: _type, hasNotch, rightVertical } = config;

    const path: string[] = [];

    let _leftEdge = rightVertical;
    // For vertical leg — match exact vertical height from right
    if (_type === 'type2') {
        _leftEdge -= CONN_NOTCH_WIDTH + CORNER_RADIUS;
        path.push(`v -${_leftEdge}`);

        if (hasNotch) {
            path.push(..._generateNotchLeft());
        }
    } else {
        _leftEdge -= CORNER_RADIUS;
        path.push(`v -${_leftEdge.toFixed(2)}`);
    }

    return { path, leftEdge: _leftEdge };
}

// function to generate the nested path for type3 bricks
function _generateNestedPath(config: {
    bBoxNesting: TBBox[];
    strokeWidth: number;
    bBoxLabel: TBBox;
    hasSecondaryLabel: boolean;
}): string[] {
    const { bBoxNesting, strokeWidth, bBoxLabel, hasSecondaryLabel } = config;

    let totalNestedHeight = 0;
    for (let i = 0; i < bBoxNesting.length; i++) {
        totalNestedHeight += bBoxNesting[i].h;
    }
    totalNestedHeight = Math.max(MIN_NESTED_HEIGHT, totalNestedHeight);

    function _generateInnerLeft(): string[] {
        const variableLength =
            totalNestedHeight -
            (strokeWidth / 2 + OUTER_CORNER_RADIUS + OUTER_CORNER_RADIUS + strokeWidth / 2);

        return [
            `a ${OUTER_CORNER_RADIUS} ${OUTER_CORNER_RADIUS} 90 0 0 -${OUTER_CORNER_RADIUS} ${CORNER_RADIUS}`,
            `v ${Math.max(0, +variableLength.toFixed(2))}`,
        ];
    }

    // function to generate the nested bottom part of the svg for type3 bricks
    let labelHeight = 0;
    let variableBottomWidth = 0;
    function _generateNestedBottom(): string[] {
        const hasNotch = true;

        const variableWidth = variableBottomWidth + OFFSET_NOTCH_BOTTOM;

        labelHeight =
            strokeWidth / 2 +
            Math.max(MIN_LABEL_HEIGHT, bBoxLabel.h) +
            strokeWidth / 2 -
            CORNER_RADIUS * 2;

        const variableOuterWidth = variableWidth + WIDTH_NOTCH_TOP - strokeWidth / 2;

        return [
            `a ${OUTER_CORNER_RADIUS} ${OUTER_CORNER_RADIUS} 90 0 0 ${OUTER_CORNER_RADIUS} ${OUTER_CORNER_RADIUS}`,
            `h ${OFFSET_NOTCH_TOP}`,
            ...(hasNotch ? _generateNotchTop() : [`h ${WIDTH_NOTCH_TOP}`]),
            `h ${variableWidth}`,
            `a ${CORNER_RADIUS} ${CORNER_RADIUS} 90 0 1 ${CORNER_RADIUS} ${CORNER_RADIUS}`,
            ...(hasSecondaryLabel ? [`v ${labelHeight}`] : ['v 4']),
            `a ${CORNER_RADIUS} ${CORNER_RADIUS} 90 0 1 -${CORNER_RADIUS} ${CORNER_RADIUS}`,
            `h -${variableOuterWidth - 2*strokeWidth}`,
            ...(hasNotch ? _generateNotchBottom(strokeWidth) : [`h -${WIDTH_NOTCH_BOTTOM}`]),
            `h -${OFFSET_NOTCH_BOTTOM}`,
        ];
    }

    // function to generate the nested outer left part of the svg for type3 bricks
    function _generateNestedOuterLeft(): string[] {
        const variableLength =
            totalNestedHeight -
            (strokeWidth / 2 + OUTER_CORNER_RADIUS + OUTER_CORNER_RADIUS + strokeWidth / 2);
        return [
            `a ${CORNER_RADIUS} ${CORNER_RADIUS} 90 0 1 -${CORNER_RADIUS} -${CORNER_RADIUS}`,
            ...(hasSecondaryLabel ? [`v -${labelHeight}`] : ['v -4']),
            `v -${CORNER_RADIUS}`,
            `v -${OUTER_CORNER_RADIUS}`,
            `v -${Math.max(0, +variableLength.toFixed(2))}`,
            `v -${CORNER_RADIUS}`,
            `v -${CORNER_RADIUS}`,
        ];
    }

    return [..._generateInnerLeft(), ..._generateNestedBottom(), ..._generateNestedOuterLeft()];
}

// function to generate the bottom part of the svg
let variableBottomWidth = 0;
function _generateBottom(config: {
    type: string;
    hasNotch: boolean;
    hasArgs: boolean;
    strokeWidth: number;
    bBoxLabel: TBBox;
    hasSecondaryLabel: boolean;
    bBoxNesting: TBBox[];
}): string[] {
    const { type, hasNotch, hasArgs, strokeWidth, bBoxLabel, hasSecondaryLabel, bBoxNesting } =
        config;

    //Corner Radius + Variable width + Notch + Offset + Corner Radius = Stroke Width/2 + LabelBounding Box width + Stroke Width/2
    if (type === 'type3') {
        variableBottomWidth =
            Math.max(MIN_LABEL_WIDTH, bBoxLabel.w) -
            CORNER_RADIUS -
            OFFSET_NOTCH_TOP -
            WIDTH_NOTCH_TOP -
            WIDTH_NOTCH_BOTTOM -
            strokeWidth / 2;
    } else {
        variableBottomWidth =
            strokeWidth / 2 +
            Math.max(MIN_LABEL_WIDTH, bBoxLabel.w) +
            strokeWidth / 2 -
            CORNER_RADIUS -
            WIDTH_NOTCH_BOTTOM -
            OFFSET_NOTCH_BOTTOM -
            CORNER_RADIUS;
    }
    return [
        //
        `a ${CORNER_RADIUS} ${CORNER_RADIUS} 90 0 1 -${CORNER_RADIUS} ${CORNER_RADIUS}`,
        ...(hasArgs ? ['h -4'] : ['h -0']),
        `h -${variableBottomWidth}`,
        ...(hasNotch ? _generateNotchBottom(strokeWidth) : [`h -${WIDTH_NOTCH_BOTTOM}`]),
        `h -${OFFSET_NOTCH_RIGHT}`,
        ...(type !== 'type3'
            ? [`a ${CORNER_RADIUS} ${CORNER_RADIUS} 90 0 1 -${CORNER_RADIUS} -${CORNER_RADIUS}`]
            : _generateNestedPath({
                  bBoxNesting,
                  strokeWidth,
                  bBoxLabel,
                  hasSecondaryLabel,
              })),
    ];
}

// -----------------------------------------------------------

// function to generate the path based on the configuration
function generatePath(config: TInputType1 | TInputType2 | TInputType3): {
    path: string;
    leftEdge: number;
} {
    const hasNotchTop = config.type !== 'type2' && config.hasNotchAbove;

    const top = _generateTop({
        type: config.type,
        hasArgs: config.bBoxArgs.length > 0,
        hasNotch: hasNotchTop,
        strokeWidth: config.strokeWidth,
        bBoxLabel: config.bBoxLabel,
    });

    const rightResult = _generateRight({
        hasArgs: config.bBoxArgs.length > 0,
        strokeWidth: config.strokeWidth,
        bBoxLabel: config.bBoxLabel,
        bBoxArgs: config.bBoxArgs,
    });

    const right = rightResult.path;
    const rightVertical = rightResult.vertical;

    const hasNotchBottom = config.type !== 'type2' && config.hasNotchBelow;

    let hasSecondaryLabel = false;
    let bBoxNesting: TBBox[] = [];

    if (config.type === 'type3') {
        hasSecondaryLabel = config.secondaryLabel;
        bBoxNesting = config.bBoxNesting;
    }

    const bottom = _generateBottom({
        type: config.type,
        hasNotch: hasNotchBottom,
        hasArgs: config.bBoxArgs.length > 0,
        strokeWidth: config.strokeWidth,
        bBoxLabel: config.bBoxLabel,
        hasSecondaryLabel: hasSecondaryLabel,
        bBoxNesting: bBoxNesting,
    });

    const leftResult = _generateLeft({
        type: config.type,
        hasNotch: true,
        strokeWidth: config.strokeWidth,
        rightVertical,
    });

    const left = leftResult.path;
    const leftEdge = leftResult.leftEdge;

    const segments = [...top, ...right, ...bottom, ...left];

    return {
        path: ['m 0,0', ...segments].join(' '),
        leftEdge: leftEdge,
    };
}

// function to calculate the bounding box values
function getBoundingBox(config: TInputUnion): TBBox {
    const { strokeWidth, bBoxLabel, bBoxArgs, type } = config;

    const hasArgs = bBoxArgs.length > 0;
    const labelWidth = Math.max(MIN_LABEL_WIDTH, bBoxLabel.w);

    // Match variableTopWidth logic from _generateTop
    const variableTopWidth =
        strokeWidth / 2 +
        labelWidth +
        strokeWidth / 2 -
        CORNER_RADIUS -
        WIDTH_NOTCH_TOP -
        OFFSET_NOTCH_TOP -
        CORNER_RADIUS;

    // Base width as per _generateTop and _generateBottom logic
    const baseWidth = CORNER_RADIUS + OFFSET_NOTCH_TOP + WIDTH_NOTCH_TOP + variableTopWidth;

    const width = hasArgs
        ? baseWidth + OFFSET_NOTCH_RIGHT + CORNER_RADIUS + strokeWidth / 2
        : baseWidth + CORNER_RADIUS + strokeWidth / 2;

    // Get rightVertical from _generateRight
    const { vertical: rightVertical } = _generateRight({
        hasArgs,
        strokeWidth,
        bBoxLabel,
        bBoxArgs: bBoxArgs || [],
    });

    let height = rightVertical + CORNER_RADIUS + (type !== 'type3' ? strokeWidth / 2 : 0);

    if (type === 'type3') {
        const { bBoxNesting, secondaryLabel } = config as TInputType3;

        // Reuse nested path logic
        const bBoxNesting3 = bBoxNesting || [];
        let nestingHeight = bBoxNesting3.length > 0 ? bBoxNesting3.reduce((sum: number, box: TBBox) => sum + box.h, 0) : 0;
        nestingHeight = Math.max(nestingHeight, MIN_NESTED_HEIGHT);

        const labelHeight = Math.max(MIN_LABEL_HEIGHT, bBoxLabel.h);
        const labelAreaHeight = secondaryLabel
            ? strokeWidth / 2 + labelHeight + strokeWidth / 2 - CORNER_RADIUS * 2
            : 4;

        const nestedTotal =
            OUTER_CORNER_RADIUS +
            (nestingHeight - (strokeWidth / 2 + OUTER_CORNER_RADIUS * 2 + strokeWidth / 2)) +
            OUTER_CORNER_RADIUS +
            CORNER_RADIUS +
            labelAreaHeight +
            CORNER_RADIUS;

        height += nestedTotal;
    }

    return {
        w: width,
        h: height,
    };
}

// functions to calculate coordinates of the connection points

type TCentroid = { x: number; y: number };

// Centroid calculation for Top Notch
function getTopCentroid(config: TInputUnion): TCentroid | undefined {
    if (config.type === 'type2' || !config.hasNotchAbove) return undefined;

    return {
        x: CORNER_RADIUS + OFFSET_NOTCH_TOP + WIDTH_NOTCH_TOP / 2,
        y: 1,
    };
}

// Centroid calculation for Bottom Notch
function getBottomCentroid(
    config: TInputUnion,
    boundingBox: TBBox,
    _leftEdge: number,
): TCentroid | undefined {
    if (config.type === 'type2' || !config.hasNotchBelow) return undefined;

    if (config.type !== 'type3') {
        return {
            x: CORNER_RADIUS + OFFSET_NOTCH_BOTTOM + WIDTH_NOTCH_BOTTOM / 2,
            y: boundingBox.h - 1, // Place at the bottom edge
        };
    }

    return {
        x:
            CORNER_RADIUS +
            OFFSET_NOTCH_TOP +
            WIDTH_NOTCH_TOP / 2 +
            OFFSET_NOTCH_BOTTOM +
            WIDTH_NOTCH_BOTTOM / 2, //used the logic for top notch centroid
        y: boundingBox.h - 1, // Place at the bottom edge for type3 as well
    };
}

// Calculate centroids for right connector notch
function getRightCentroids(config: TInputUnion, boundingBox: TBBox): TCentroid[] {
    const { bBoxArgs = [], bBoxLabel, strokeWidth } = config;

    // No argument = no right notches
    if (!bBoxArgs.length) return [];

    const centroids: TCentroid[] = [];

    const labelHeight = Math.max(MIN_LABEL_HEIGHT, bBoxLabel.h);
    const requiredMinimum = strokeWidth / 2 + labelHeight + strokeWidth / 2;
    const argHeightsSum = bBoxArgs.length > 0 ? bBoxArgs.reduce((sum, arg) => sum + arg.h, 0) : 0;

    const extra = Math.max(0, requiredMinimum - argHeightsSum);

    let verticalOffset = CORNER_RADIUS; // top-right corner arc

    for (let i = 0; i < bBoxArgs.length; i++) {
        const extraPerArg = extra / bBoxArgs.length;
        const argBox = bBoxArgs[i];

        // v4, v-3, v10, v-3, v4 = total 12
        const fixedNotchHeight = 12;

        const variableLength = Math.max(
            0,
            argBox.h +
                extraPerArg -
                (strokeWidth / 2 +
                    CORNER_RADIUS +
                    HEIGHT_NOTCH_RIGHT +
                    CORNER_RADIUS +
                    strokeWidth / 2 +
                    CORNER_RADIUS +
                    strokeWidth +
                    CORNER_RADIUS),
        );

        // Centroid placed in the middle of v10
        const centroidY = verticalOffset + 6;

        centroids.push({
            x: boundingBox.w - 5, // notch is 8 wide, so center is at 4 from right edge + strokewidth/2
            y: centroidY,
        });

        verticalOffset += fixedNotchHeight; // 12 units fixed

        if (variableLength > 0) {
            verticalOffset += variableLength;
        }

        if (i < bBoxArgs.length - 1) {
            verticalOffset += CORNER_RADIUS + strokeWidth + CORNER_RADIUS; // 4 + 2 + 4 = 10 units
        }
    }

    return centroids;
}

// Calculate centroid for left connector notch
function getLeftCentroid(config: TInputUnion, _boundingBox: TBBox): TCentroid | undefined {
    if (config.type !== 'type2') return undefined;

    return {
        x: -7, // notch is made of h -6, h -2 → center = -7
        y: CORNER_RADIUS + CONN_NOTCH_WIDTH / 2,
    };
}

function getConnectionPoints(
    config: TInputUnion,
    boundingBox: TBBox,
    leftEdge: number,
): {
    top?: TCentroid;
    right: TCentroid[];
    bottom?: TCentroid;
    left?: TCentroid;
} {
    return {
        top: getTopCentroid(config),
        right: getRightCentroids(config, boundingBox),
        bottom: getBottomCentroid(config, boundingBox, leftEdge),
        left: getLeftCentroid(config, boundingBox),
    };
}

// single export function to return brick data
export function generateBrickData(config: TInputType1 | TInputType2 | TInputType3): {
    path: string;
    boundingBox: TBBox;
    connectionPoints: {
        top?: TCentroid;
        right: TCentroid[];
        bottom?: TCentroid;
        left?: TCentroid;
        args?: { x: number; y: number }[];
        nested?: { x: number; y: number };
    };
} {
    const { path, leftEdge } = generatePath(config);
    const boundingBox = getBoundingBox(config);
    const connectionPoints = getConnectionPoints(config, boundingBox, leftEdge);

    // Argument slot origins (for all types with args)
    let args: { x: number; y: number }[] | undefined = undefined;
    if (connectionPoints.right && connectionPoints.right.length > 0) {
        args = connectionPoints.right.map((pt) => ({ x: pt.x, y: pt.y }));
        // Calculate origin for the argument brick based on the connection coordinates 
        args.forEach((pt) => {
            pt.x = pt.x + OFFSET_NOTCH_RIGHT/2 + CORNER_RADIUS; // + strokewidth at the end
            pt.y = pt.y - CORNER_RADIUS - HEIGHT_NOTCH_RIGHT/2;
        });
    }

    //nesting height to calculate the nested origin, either here or use it from the getBoundingBox function
    const bBoxNesting = (config as any).bBoxNesting || [];
    let nestingHeight = bBoxNesting.length > 0 ? bBoxNesting.reduce((sum: number, box: TBBox) => sum + box.h, 0) : 0;
    nestingHeight = Math.max(nestingHeight, MIN_NESTED_HEIGHT);

    // Nested region origin (for type3/compound)
    let nested: { x: number; y: number } | undefined = undefined;
    if ((config as any).type === 'type3' && connectionPoints.bottom) {
        nestingHeight += CORNER_RADIUS + 2;
        nested = {
            x: connectionPoints.bottom.x - WIDTH_NOTCH_BOTTOM / 2 - OFFSET_NOTCH_BOTTOM - CORNER_RADIUS - 2,//strokewidth,
            y: connectionPoints.bottom.y - CORNER_RADIUS*2 - 4 - nestingHeight,
        };
    }

    return {
        path,
        boundingBox,
        connectionPoints: {
            top: connectionPoints.top,
            right: connectionPoints.right,
            bottom: connectionPoints.bottom,
            left: connectionPoints.left,
            args,
            nested,
        },
    };
}
