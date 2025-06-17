type TBBox = { w: number; h: number };

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
function _generateNotchBottom(strokeWidth: number): string[] {
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
    const { type, hasNotch, strokeWidth, bBoxLabel, hasArgs } = config;

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
        const argHeightsSum = bBoxArgs.reduce((sum, arg) => sum + arg.h, 0);
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
}): string[] {
    const { type, hasNotch, rightVertical } = config;

    const path: string[] = [];

    let leftEdge = rightVertical;
    // For vertical leg — match exact vertical height from right
    if (type === 'type2') {
        leftEdge -= CONN_NOTCH_WIDTH + CORNER_RADIUS;
        path.push(`v -${leftEdge}`);

        if (hasNotch) {
            path.push(..._generateNotchLeft());
        }
    } else {
        leftEdge -= CORNER_RADIUS;
        path.push(`v -${leftEdge.toFixed(2)}`);
    }

    return path;
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
            `h -${variableOuterWidth}`,
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

// Main function to generate the path based on the configuration
export function generatePath(config: TInputType1 | TInputType2 | TInputType3): {
    path: string;
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

    const left = _generateLeft({
        type: config.type,
        hasNotch: true,
        strokeWidth: config.strokeWidth,
        rightVertical: rightVertical,
    });

    return {
        path: [...top, ...right, ...bottom, ...left].join(' '),
    };
}
