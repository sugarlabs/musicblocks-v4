// newpath.ts - Brick SVG outline generation (geometry only, no rendering).
// Mirrors generateBrickData from path.ts but takes an outline-only config:
// properties that don't affect the SVG boundary (color, label text, tooltip,
// icon, image, selector, addButton, variableArguments, etc.) are excluded.

//Types

export type Dimension = { w: number; h: number };
export type Centroid = { x: number; y: number };

// Argument count is derived from argumentDimensions.length (analogous to
// bBoxArgs.length in path.ts) - there is no separate count property.
export interface BrickOutlineConfig {
    hasTopNotch: boolean;
    hasBottomNotch: boolean;
    // First-class outline property:- NOT hard-coded to a particular brick type.
    hasLeftNotch: boolean;
    containsNesting: boolean;
    nestingDimensions: Dimension[];
    argumentDimensions: Dimension[];
    labelWidth: number;
    labelHeight: number;
    secondaryLabel: boolean;
    strokeWidth: number;
}

export interface BrickOutlineResult {
    path: string;
    boundingBox: Dimension;
    connectionPoints: {
        top?: Centroid;
        right: Centroid[];
        bottom?: Centroid;
        left?: Centroid;
        args?: Centroid[];
        nested?: Centroid;
    };
}

//Constants
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

//Notch generations

// function for Top Notch generation
function _generateNotchTop(): string[] {
    return [
        //
        'v 2',
        'h 10',
        'v -2',
    ];
}

// function for Bottom Notch generation
function _generateNotchBottom(): string[] {
    return [
        //
        'h -1',
        'v 2',
        'h -8',
        'v -2',
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

//Path Generation

// function to generate the top part of the svg
function _generateTop(config: {
    hasNotch: boolean;
    hasArgs: boolean;
    strokeWidth: number;
    effectiveLabelWidth: number;
}): string[] {
    const { hasNotch, hasArgs, strokeWidth, effectiveLabelWidth } = config;

    const variableTopWidth =
        strokeWidth / 2 +
        effectiveLabelWidth +
        strokeWidth / 2 -
        CORNER_RADIUS -
        WIDTH_NOTCH_TOP -
        OFFSET_NOTCH_TOP -
        CORNER_RADIUS;

    return [
        `a ${CORNER_RADIUS} ${CORNER_RADIUS} 90 0 1 ${CORNER_RADIUS} -${CORNER_RADIUS}`,
        `h ${OFFSET_NOTCH_TOP}`,
        ...(hasNotch ? _generateNotchTop() : [`h ${WIDTH_NOTCH_TOP}`]),
        `h ${variableTopWidth}`,
        ...(hasArgs ? [`h ${OFFSET_NOTCH_RIGHT}`] : []),
    ];
}

// function to generate the right part of the svg. Returns the path segments and
// the total vertical distance traversed (needed by the left-edge generator).
function _generateRight(config: {
    hasArgs: boolean;
    strokeWidth: number;
    effectiveLabelHeight: number;
    argumentDimensions: Dimension[];
}): { path: string[]; vertical: number } {
    const { hasArgs, strokeWidth, effectiveLabelHeight, argumentDimensions } = config;

    const path: string[] = [];
    let vertical = 0;

    path.push(`a ${CORNER_RADIUS} ${CORNER_RADIUS} 90 0 1 ${CORNER_RADIUS} ${CORNER_RADIUS}`);
    vertical += CORNER_RADIUS;

    if (hasArgs) {
        const requiredMinimum = strokeWidth / 2 + effectiveLabelHeight + strokeWidth / 2;
        const argHeightsSum =
            argumentDimensions.length > 0
                ? argumentDimensions.reduce((sum, arg) => sum + arg.h, 0)
                : 0;
        const extra = Math.max(0, requiredMinimum - argHeightsSum);

        for (let i = 0; i < argumentDimensions.length; i++) {
            const argBox = argumentDimensions[i];

            const fixedNotchHeight =
                strokeWidth / 2 +
                CORNER_RADIUS +
                HEIGHT_NOTCH_RIGHT +
                CORNER_RADIUS +
                strokeWidth / 2;
            const connectingBrickTransitions = CORNER_RADIUS + strokeWidth + CORNER_RADIUS;
            const totalFixedHeight = fixedNotchHeight + connectingBrickTransitions;

            const extraPerArg = extra / argumentDimensions.length;
            const totalRequiredForThisArg = argBox.h + extraPerArg;
            const variableLength = Math.max(0, totalRequiredForThisArg - totalFixedHeight);

            path.push(..._generateNotchRight());
            vertical += 4 + -3 + 10 + -3 + 4; // net 12 from notch path

            if (variableLength > 0) {
                path.push(`v ${variableLength.toFixed(2)}`);
                vertical += variableLength;
            }

            if (i < argumentDimensions.length - 1) {
                path.push(`v ${CORNER_RADIUS}`);
                path.push(`v ${strokeWidth}`);
                path.push(`v ${CORNER_RADIUS}`);
                vertical += CORNER_RADIUS + strokeWidth + CORNER_RADIUS;
            }
        }
    } else {
        const totalHeight = strokeWidth / 2 + effectiveLabelHeight + strokeWidth / 2;
        const rightEdge = Math.max(totalHeight - CORNER_RADIUS * 2, HEIGHT_NOTCH_RIGHT);
        path.push(`v ${rightEdge.toFixed(2)}`);
        vertical += rightEdge;
    }

    return { path, vertical };
}

// function to generate the nested path for compound (clamp) bricks
function _generateNestedPath(config: {
    nestingDimensions: Dimension[];
    strokeWidth: number;
    effectiveLabelWidth: number;
    effectiveLabelHeight: number;
    hasSecondaryLabel: boolean;
}): string[] {
    const {
        nestingDimensions,
        strokeWidth,
        effectiveLabelWidth: _effectiveLabelWidth,
        effectiveLabelHeight,
        hasSecondaryLabel,
    } = config;

    let totalNestedHeight = 0;
    for (let i = 0; i < nestingDimensions.length; i++) {
        totalNestedHeight += nestingDimensions[i].h;
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

    // Clamp bricks use a NARROW bottom foot (just wide enough to carry the
    // connector notch for the brick below), not a full-width arm that closes the
    // cavity. See the v3 "note value" clamp: wide top bar, short bottom foot.
    // path.ts produces this with a local variableBottomWidth that stays 0.
    const variableBottomWidth = 0;

    let labelAreaHeight = 0;

    // function to generate the nested bottom part of the svg
    function _generateNestedBottom(): string[] {
        const hasNotch = true; // nested bottom always has a notch

        const variableWidth = variableBottomWidth + OFFSET_NOTCH_BOTTOM;

        labelAreaHeight =
            strokeWidth / 2 + effectiveLabelHeight + strokeWidth / 2 - CORNER_RADIUS * 2;

        const variableOuterWidth = variableWidth + WIDTH_NOTCH_TOP - strokeWidth / 2;

        return [
            `a ${OUTER_CORNER_RADIUS} ${OUTER_CORNER_RADIUS} 90 0 0 ${OUTER_CORNER_RADIUS} ${OUTER_CORNER_RADIUS}`,
            `h ${OFFSET_NOTCH_TOP}`,
            ...(hasNotch ? _generateNotchTop() : [`h ${WIDTH_NOTCH_TOP}`]),
            `h ${variableWidth}`,
            `a ${CORNER_RADIUS} ${CORNER_RADIUS} 90 0 1 ${CORNER_RADIUS} ${CORNER_RADIUS}`,
            ...(hasSecondaryLabel ? [`v ${labelAreaHeight}`] : ['v 4']),
            `a ${CORNER_RADIUS} ${CORNER_RADIUS} 90 0 1 -${CORNER_RADIUS} ${CORNER_RADIUS}`,
            `h -${variableOuterWidth - 2 * strokeWidth}`,
            ...(hasNotch ? _generateNotchBottom() : [`h -${WIDTH_NOTCH_BOTTOM}`]),
            `h -${OFFSET_NOTCH_BOTTOM}`,
        ];
    }

    // function to generate the nested outer left part of the svg
    function _generateNestedOuterLeft(): string[] {
        const variableLength =
            totalNestedHeight -
            (strokeWidth / 2 + OUTER_CORNER_RADIUS + OUTER_CORNER_RADIUS + strokeWidth / 2);
        return [
            `a ${CORNER_RADIUS} ${CORNER_RADIUS} 90 0 1 -${CORNER_RADIUS} -${CORNER_RADIUS}`,
            ...(hasSecondaryLabel ? [`v -${labelAreaHeight}`] : ['v -4']),
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
function _generateBottom(config: {
    containsNesting: boolean;
    hasNotch: boolean;
    hasArgs: boolean;
    strokeWidth: number;
    effectiveLabelWidth: number;
    effectiveLabelHeight: number;
    hasSecondaryLabel: boolean;
    nestingDimensions: Dimension[];
}): string[] {
    const {
        containsNesting,
        hasNotch,
        hasArgs,
        strokeWidth,
        effectiveLabelWidth,
        effectiveLabelHeight,
        hasSecondaryLabel,
        nestingDimensions,
    } = config;

    let variableBottomWidth: number;

    if (containsNesting) {
        variableBottomWidth =
            Math.max(MIN_LABEL_WIDTH, effectiveLabelWidth) -
            CORNER_RADIUS -
            OFFSET_NOTCH_TOP -
            WIDTH_NOTCH_TOP -
            WIDTH_NOTCH_BOTTOM -
            strokeWidth / 2;
    } else {
        variableBottomWidth =
            strokeWidth / 2 +
            Math.max(MIN_LABEL_WIDTH, effectiveLabelWidth) +
            strokeWidth / 2 -
            CORNER_RADIUS -
            WIDTH_NOTCH_BOTTOM -
            OFFSET_NOTCH_BOTTOM -
            CORNER_RADIUS;
    }

    return [
        `a ${CORNER_RADIUS} ${CORNER_RADIUS} 90 0 1 -${CORNER_RADIUS} ${CORNER_RADIUS}`,
        ...(hasArgs ? ['h -4'] : ['h -0']),
        `h -${variableBottomWidth}`,
        ...(hasNotch ? _generateNotchBottom() : [`h -${WIDTH_NOTCH_BOTTOM}`]),
        `h -${OFFSET_NOTCH_RIGHT}`,
        ...(!containsNesting
            ? [`a ${CORNER_RADIUS} ${CORNER_RADIUS} 90 0 1 -${CORNER_RADIUS} -${CORNER_RADIUS}`]
            : _generateNestedPath({
                  nestingDimensions,
                  strokeWidth,
                  effectiveLabelWidth,
                  effectiveLabelHeight,
                  hasSecondaryLabel,
              })),
    ];
}

// function to generate the left part of the svg
function _generateLeft(config: { hasLeftNotch: boolean; rightVertical: number }): {
    path: string[];
    leftEdge: number;
} {
    const { hasLeftNotch, rightVertical } = config;

    const path: string[] = [];

    let leftEdge = rightVertical;

    if (hasLeftNotch) {
        leftEdge -= CONN_NOTCH_WIDTH + CORNER_RADIUS;
        path.push(`v -${leftEdge}`);
        path.push(..._generateNotchLeft());
    } else {
        leftEdge -= CORNER_RADIUS;
        path.push(`v -${leftEdge.toFixed(2)}`);
    }

    return { path, leftEdge };
}

// function to generate the path based on the configuration
function _generatePath(config: BrickOutlineConfig): {
    path: string;
    leftEdge: number;
} {
    const {
        hasTopNotch,
        hasBottomNotch,
        hasLeftNotch,
        containsNesting,
        nestingDimensions,
        argumentDimensions,
        labelWidth,
        labelHeight,
        secondaryLabel,
        strokeWidth,
    } = config;

    const effectiveLabelWidth = Math.max(MIN_LABEL_WIDTH, labelWidth);
    const effectiveLabelHeight = Math.max(MIN_LABEL_HEIGHT, labelHeight);
    const hasArgs = argumentDimensions.length > 0;

    const top = _generateTop({
        hasNotch: hasTopNotch,
        hasArgs,
        strokeWidth,
        effectiveLabelWidth,
    });

    const rightResult = _generateRight({
        hasArgs,
        strokeWidth,
        effectiveLabelHeight,
        argumentDimensions,
    });
    const right = rightResult.path;
    const rightVertical = rightResult.vertical;

    const bottom = _generateBottom({
        containsNesting,
        hasNotch: hasBottomNotch,
        hasArgs,
        strokeWidth,
        effectiveLabelWidth,
        effectiveLabelHeight,
        hasSecondaryLabel: secondaryLabel,
        nestingDimensions: containsNesting ? nestingDimensions : [],
    });

    const leftResult = _generateLeft({
        hasLeftNotch,
        rightVertical,
    });
    const left = leftResult.path;
    const leftEdge = leftResult.leftEdge;

    const segments = [...top, ...right, ...bottom, ...left];

    return {
        path: ['m 0,0', ...segments].join(' '),
        leftEdge,
    };
}

// function to calculate the bounding box values
function _getBoundingBox(config: BrickOutlineConfig): Dimension {
    const {
        hasLeftNotch,
        containsNesting,
        nestingDimensions,
        argumentDimensions,
        labelWidth,
        labelHeight,
        secondaryLabel,
        strokeWidth,
    } = config;

    const hasArgs = argumentDimensions.length > 0;
    const effectiveLabelWidth = Math.max(MIN_LABEL_WIDTH, labelWidth);
    const effectiveLabelHeight = Math.max(MIN_LABEL_HEIGHT, labelHeight);

    // Match variableTopWidth logic from _generateTop
    const variableTopWidth =
        strokeWidth / 2 +
        effectiveLabelWidth +
        strokeWidth / 2 -
        CORNER_RADIUS -
        WIDTH_NOTCH_TOP -
        OFFSET_NOTCH_TOP -
        CORNER_RADIUS;

    const baseWidth = CORNER_RADIUS + OFFSET_NOTCH_TOP + WIDTH_NOTCH_TOP + variableTopWidth;

    const width = hasArgs
        ? baseWidth + OFFSET_NOTCH_RIGHT + CORNER_RADIUS + strokeWidth / 2 + (hasLeftNotch ? 7 : 0)
        : baseWidth + CORNER_RADIUS + strokeWidth / 2;

    const { vertical: rightVertical } = _generateRight({
        hasArgs,
        strokeWidth,
        effectiveLabelHeight,
        argumentDimensions,
    });

    let height =
        rightVertical + CORNER_RADIUS + (hasLeftNotch ? strokeWidth / 2 - 1 : strokeWidth / 2);

    if (containsNesting) {
        const nestDims = nestingDimensions || [];
        let nestingHeight =
            nestDims.length > 0
                ? nestDims.reduce((sum: number, box: Dimension) => sum + box.h, 0)
                : 0;
        nestingHeight = Math.max(nestingHeight, MIN_NESTED_HEIGHT);

        const labelAreaHeight = secondaryLabel
            ? strokeWidth / 2 + effectiveLabelHeight + strokeWidth / 2 - CORNER_RADIUS * 2
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

    return { w: width, h: height };
}

// functions to calculate coordinates of the connection points

// Centroid calculation for Top Notch
function _getTopCentroid(config: BrickOutlineConfig): Centroid | undefined {
    if (!config.hasTopNotch) return undefined;
    return {
        x: CORNER_RADIUS + OFFSET_NOTCH_TOP + WIDTH_NOTCH_TOP / 2,
        y: 1,
    };
}

// Centroid calculation for Bottom Notch
function _getBottomCentroid(
    config: BrickOutlineConfig,
    boundingBox: Dimension,
): Centroid | undefined {
    if (!config.hasBottomNotch) return undefined;

    if (!config.containsNesting) {
        return {
            x: CORNER_RADIUS + OFFSET_NOTCH_BOTTOM + WIDTH_NOTCH_BOTTOM / 2,
            y: boundingBox.h - 1,
        };
    }

    return {
        x:
            CORNER_RADIUS +
            OFFSET_NOTCH_TOP +
            WIDTH_NOTCH_TOP / 2 +
            OFFSET_NOTCH_BOTTOM +
            WIDTH_NOTCH_BOTTOM / 2,
        y: boundingBox.h - 1,
    };
}

// Calculate centroids for right connector notches (one per argument)
function _getRightCentroids(config: BrickOutlineConfig, boundingBox: Dimension): Centroid[] {
    const { argumentDimensions, strokeWidth, labelHeight } = config;
    if (argumentDimensions.length === 0) return [];

    const centroids: Centroid[] = [];
    const effectiveLabelHeight = Math.max(MIN_LABEL_HEIGHT, labelHeight);
    const requiredMinimum = strokeWidth / 2 + effectiveLabelHeight + strokeWidth / 2;
    const argHeightsSum =
        argumentDimensions.length > 0 ? argumentDimensions.reduce((sum, arg) => sum + arg.h, 0) : 0;
    const extra = Math.max(0, requiredMinimum - argHeightsSum);

    let verticalOffset = CORNER_RADIUS; // top-right corner arc

    for (let i = 0; i < argumentDimensions.length; i++) {
        const extraPerArg = extra / argumentDimensions.length;
        const argBox = argumentDimensions[i];

        const fixedNotchHeight = 12; // v4 + v-3 + v10 + v-3 + v4

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

        const centroidY = verticalOffset + 6; // middle of the v10 segment

        centroids.push({
            x: boundingBox.w - 5,
            y: centroidY,
        });

        verticalOffset += fixedNotchHeight;

        if (variableLength > 0) {
            verticalOffset += variableLength;
        }

        if (i < argumentDimensions.length - 1) {
            verticalOffset += CORNER_RADIUS + strokeWidth + CORNER_RADIUS;
        }
    }

    return centroids;
}

// Calculate centroid for left connector notch
function _getLeftCentroid(config: BrickOutlineConfig): Centroid | undefined {
    if (!config.hasLeftNotch) return undefined;
    return {
        x: -7, // notch is made of h -6, h -2 → centre = -7
        y: CORNER_RADIUS + CONN_NOTCH_WIDTH / 2,
    };
}

function _getConnectionPoints(
    config: BrickOutlineConfig,
    boundingBox: Dimension,
): {
    top?: Centroid;
    right: Centroid[];
    bottom?: Centroid;
    left?: Centroid;
} {
    return {
        top: _getTopCentroid(config),
        right: _getRightCentroids(config, boundingBox),
        bottom: _getBottomCentroid(config, boundingBox),
        left: _getLeftCentroid(config),
    };
}

// single export function to return brick outline data
export function generateBrickOutline(config: BrickOutlineConfig): BrickOutlineResult {
    const { path } = _generatePath(config);
    const boundingBox = _getBoundingBox(config);
    const connectionPoints = _getConnectionPoints(config, boundingBox);

    // Argument slot origins (for all configs with args)
    let args: Centroid[] | undefined = undefined;
    if (connectionPoints.right.length > 0) {
        args = connectionPoints.right.map((pt) => ({
            x: pt.x + OFFSET_NOTCH_RIGHT / 2 + CORNER_RADIUS,
            y: pt.y - CORNER_RADIUS - HEIGHT_NOTCH_RIGHT / 2,
        }));
    }

    // Nested region origin (for compound/clamp bricks)
    let nested: Centroid | undefined = undefined;
    if (config.containsNesting && connectionPoints.bottom) {
        const nestDims = config.nestingDimensions || [];
        let nestingHeight =
            nestDims.length > 0
                ? nestDims.reduce((sum: number, box: Dimension) => sum + box.h, 0)
                : 0;
        nestingHeight = Math.max(nestingHeight, MIN_NESTED_HEIGHT);
        nestingHeight += CORNER_RADIUS + 2;

        nested = {
            x:
                connectionPoints.bottom.x -
                WIDTH_NOTCH_BOTTOM / 2 -
                OFFSET_NOTCH_BOTTOM -
                CORNER_RADIUS -
                2, // strokeWidth offset
            y: connectionPoints.bottom.y - CORNER_RADIUS * 2 - 4 - nestingHeight,
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
