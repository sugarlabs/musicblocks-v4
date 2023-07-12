// == constants ====================================================================================

const cornerRadius = 4;
const strokeWidth = 0.5;

const notchInsOffsetX = 4;
const notchInsLengthX = 10;
const notchInsLengthY = 2;

const notchArgLengthX = 8;
const notchArgLengthY = 12;
const notchArgBaseLengthX = 4;
const notchArgBaseLengthY = 10;
const notchArgStemLengthY = 4;

const nestLengthYMin = cornerRadius * 2 + notchArgLengthY;
const innerLengthXMin = cornerRadius * 2 + notchInsOffsetX * 2 + notchInsLengthX;

// == private variables ============================================================================

let _hasNest = false;
let _hasNotchArg = false;
let _hasNotchInsTop = false;
let _hasNotchInsBot = false;

let _scale = 1;
let _nestLengthY = nestLengthYMin;
let _innerLengthX = innerLengthXMin;
let _argsLengthY: number[] = [];

// == private functions ============================================================================

/**
 * Sets internal variables that control the shape of the path
 * @param options options to control the shape of the path
 *
 * @private
 */
function _setOptions(options: {
    hasNest: boolean;
    hasNotchArg: boolean;
    hasNotchInsTop: boolean;
    hasNotchInsBot: boolean;
    scale: number;
    nestLengthY?: number;
    innerLengthX: number;
    argHeights: number[];
}): void {
    _hasNest = options.hasNest;

    _hasNotchArg = options.hasNotchArg;
    _hasNotchInsTop = options.hasNotchInsTop;
    _hasNotchInsBot = options.hasNotchInsBot;

    _scale = options.scale;
    if (options.nestLengthY) _nestLengthY = Math.max(nestLengthYMin, options.nestLengthY);
    _innerLengthX = Math.max(innerLengthXMin, options.innerLengthX);
    _argsLengthY = options.argHeights;
}

/**
 * Generates top section of the path (left arc to right arc)
 *
 * @remarks
 * left to right
 *
 * @private
 */
function _getPathTop(): string[] {
    const lineLengthX = _innerLengthX - cornerRadius * 2 - (notchInsOffsetX + notchInsLengthX);

    return [
        `a ${cornerRadius} ${cornerRadius} 90 0 1 ${cornerRadius} -${cornerRadius}`,
        `h ${notchInsOffsetX}`,
        ...(_hasNotchInsTop
            ? [
                  //
                  `v ${notchInsLengthY}`,
                  `h ${notchInsLengthX}`,
                  `v -${notchInsLengthY}`,
              ]
            : [
                  //
                  `h ${notchInsLengthX}`,
              ]),
        `h ${lineLengthX}`,
        `a ${cornerRadius} ${cornerRadius} 90 0 1 ${cornerRadius} ${cornerRadius}`,
    ];
}

/**
 * Generates bottom section of the path (right arc to left arc; includes nest)
 *
 * @remarks
 * right to left
 *
 * @private
 */
function _getPathBottom(): string[] {
    if (!_hasNest) {
        const lineLengthX = _innerLengthX - cornerRadius * 2 - (notchInsOffsetX + notchInsLengthX);

        return [
            `a ${cornerRadius} ${cornerRadius} 90 0 1 -${cornerRadius} ${cornerRadius}`,
            `h -${lineLengthX}`,
            ...(_hasNotchInsBot
                ? [
                      'h -1',
                      `v ${notchInsLengthY}`,
                      `h -${notchInsLengthX - 2}`,
                      `v -${notchInsLengthY}`,
                      'h -1',
                  ]
                : [
                      //
                      `h -${notchInsLengthX}`,
                  ]),
            `h -${notchInsOffsetX}`,
            `a ${cornerRadius} ${cornerRadius} 90 0 1 -${cornerRadius} -${cornerRadius}`,
        ];
    }

    const lineLengthX =
        _innerLengthX -
        cornerRadius * 2 -
        (notchInsOffsetX + notchInsLengthX) -
        (cornerRadius + notchInsOffsetX + 1);

    return [
        `a ${cornerRadius} ${cornerRadius} 90 0 1 -${cornerRadius} ${cornerRadius}`,
        `h -${lineLengthX}`,
        'h -1',
        `v ${notchInsLengthY}`,
        `h -${notchInsLengthX - 2}`,
        `v -${notchInsLengthY}`,
        'h -1',
        `h -${notchInsOffsetX}`,
        `a ${cornerRadius + 1} ${cornerRadius + 1} 90 0 0 -${cornerRadius + 1} ${cornerRadius + 1}`,
        `v ${_nestLengthY - cornerRadius * 2}`,
        `a ${cornerRadius + 1} ${cornerRadius + 1} 90 0 0 ${cornerRadius + 1} ${cornerRadius + 1}`,
        `h ${notchInsOffsetX}`,
        `v ${notchInsLengthY}`,
        `h ${notchInsLengthX}`,
        `v -${notchInsLengthY}`,
        `h ${notchInsOffsetX}`,
        `a ${cornerRadius} ${cornerRadius} 90 0 1 ${cornerRadius} ${cornerRadius}`,
        `v ${notchArgLengthY}`,
        `a ${cornerRadius} ${cornerRadius} 90 0 1 -${cornerRadius} ${cornerRadius}`,
        'h -1',
        `h -${cornerRadius + notchInsOffsetX * 2}`,
        ...(_hasNotchInsBot
            ? [
                  'h -1',
                  `v ${notchInsLengthY}`,
                  `h -${notchInsLengthX - 2}`,
                  `v -${notchInsLengthY}`,
                  'h -1',
              ]
            : [
                  //
                  `h -${notchInsLengthX}`,
              ]),
        `h -${notchInsOffsetX}`,
        `a ${cornerRadius} ${cornerRadius} 90 0 1 -${cornerRadius} -${cornerRadius}`,
        `v -${cornerRadius * 2 + notchArgLengthY}`,
        'v -1',
        `v -${_nestLengthY - cornerRadius * 2}`,
        'v -1',
        `v -${cornerRadius * 2}`,
    ];
}

/**
 * Generates the argument connector (concave) positioned on the right
 *
 * @remarks
 * top to bottom
 *
 * @private
 */
function _getNotchArgInner(): string[] {
    const endLineLengthY = (notchArgLengthY - notchArgStemLengthY) / 2;
    const stemLengthX = notchArgLengthX - notchArgBaseLengthX;
    const baseRiseLengthY = (notchArgBaseLengthY - notchArgStemLengthY) / 2;

    return [
        `v ${endLineLengthY}`,
        `h -${stemLengthX}`,
        `v -${baseRiseLengthY}`,
        `h -${notchArgBaseLengthX}`,
        `v ${notchArgBaseLengthY}`,
        `h ${notchArgBaseLengthX}`,
        `v -${baseRiseLengthY}`,
        `h ${stemLengthX}`,
        `v ${endLineLengthY}`,
    ];
}

/**
 * Generates the argument connector (convex) positioned on the left
 *
 * @remarks
 * bottom to top
 *
 * @private
 */
function _getNotchArgOuter(): string[] {
    const endLineLengthY = (notchArgLengthY - notchArgStemLengthY) / 2 + 1;
    const stemLengthX = notchArgLengthX - notchArgBaseLengthX + 2;
    const baseRiseLengthY = (notchArgBaseLengthY - notchArgStemLengthY) / 2;

    return [
        `v -${endLineLengthY}`,
        `h -${stemLengthX}`,
        `v ${baseRiseLengthY}`,
        `h -${notchArgBaseLengthX - 2}`,
        `v -${notchArgBaseLengthY - 2}`,
        `h ${notchArgBaseLengthX - 2}`,
        `v ${baseRiseLengthY}`,
        `h ${stemLengthX}`,
        `v -${endLineLengthY}`,
    ];
}

/**
 * Generates portion for one argument connector (concave) positioned on the right
 * @param options determines shape
 *
 * @remarks
 * top to bottom
 *
 * @private
 */
function _generateArgSection(options: {
    /** whether protrude vertical top line */
    hasOffsetTop: boolean;
    /** whether protrude vertical bottom line */
    hasOffsetBot: boolean;
    /** total vertical length of the portion */
    sectionLengthY: number;
}): string[] {
    const { hasOffsetTop, hasOffsetBot, sectionLengthY } = options;

    const sectionOffsetTopY = hasOffsetTop ? cornerRadius : 0;
    const sectionOffsetBotY = sectionLengthY - cornerRadius - notchArgLengthY - cornerRadius;

    return [
        //
        `v ${sectionOffsetTopY}`,
        ..._getNotchArgInner(),
        `v ${hasOffsetBot ? cornerRadius : 0}`,
        `v ${sectionOffsetBotY}`,
    ];
}

/**
 * Generates right section of the path (includes argument connectors)
 *
 * @remarks
 * top to bottom
 *
 * @private
 */
function _getPathRight() {
    const sectionLengthYMin = cornerRadius * 2 + notchArgLengthY;

    return _argsLengthY.length === 0
        ? [
              //
              `v ${notchArgLengthY}`,
          ]
        : _argsLengthY
              .map((sectionLengthY, i) =>
                  _generateArgSection({
                      hasOffsetTop: i !== 0,
                      hasOffsetBot: i < _argsLengthY.length - 1,
                      sectionLengthY: Math.max(sectionLengthYMin, sectionLengthY),
                  }),
              )
              .reduce((a, b) => [...a, ...b], []);
}

/**
 * Generates left section of the path (includes argument notch)
 *
 * @remarks
 * bottom to top
 *
 * @private
 */
function _getPathLeft() {
    const lineLengthY = Math.max(
        0,
        _argsLengthY.reduce((a, b) => a + b, 0) - cornerRadius * 2 - notchArgLengthY,
    );

    return [
        //
        `v -${lineLengthY}`,
        ...(_hasNotchArg
            ? _getNotchArgOuter()
            : [
                  //
                  `v -${notchArgLengthY}`,
              ]),
    ];
}

// -- private helper functions ---------------------------------------------------------------------

/**
 * Generates brick SVG path
 *
 * @private
 */
function _getPath(): string {
    const offsetX = 0.5 + (_hasNotchArg ? notchArgLengthX : 0);
    const offsetY = 0.5 + cornerRadius;

    return [
        `m ${offsetX} ${offsetY}`,
        ...[_getPathTop(), _getPathRight(), _getPathBottom(), _getPathLeft()].map((sections) =>
            sections.join(' '),
        ),
        'z',
    ].join(' ');
}

/**
 * Generates bounding box of the brick (excludes notches)
 *
 * @private
 */
function _getBBoxBrick(): {
    extent: { width: number; height: number };
    coords: { x: number; y: number };
} {
    const argSectionLengthYMin = cornerRadius * 2 + notchArgLengthY;
    const argsLength = _argsLengthY
        .map((sectionLengthY) => Math.max(argSectionLengthYMin, sectionLengthY))
        .reduce((a, b) => a + b, 0);

    let height =
        strokeWidth +
        (argsLength !== 0 ? argsLength : 2 * cornerRadius + notchArgLengthY) +
        strokeWidth;

    if (_hasNest) {
        height += _nestLengthY + strokeWidth * 4 + 2 * cornerRadius + notchArgLengthY;
    }

    return {
        extent: {
            width: strokeWidth + _innerLengthX + strokeWidth,
            height: height,
        },
        coords: {
            x: _hasNotchArg ? notchArgLengthX : 0,
            y: 0,
        },
    };
}

/**
 * Generates bounding box of the argument notch positioned on the left
 *
 * @private
 */
function _getBBoxNotchArg(): {
    extent: { width: number; height: number };
    coords: { x: number; y: number };
} {
    return {
        extent: {
            width: _hasNotchArg ? notchArgLengthX : 0,
            height: _hasNotchArg ? strokeWidth + 8 + strokeWidth : 0,
        },
        coords: {
            x: 0,
            y: _hasNotchArg ? 6 : 0,
        },
    };
}

/**
 * Generates bounding box of the top instruction notch
 *
 * @private
 */
function _getBBoxNotchInsTop(): {
    extent: { width: number; height: number };
    coords: { x: number; y: number };
} {
    return {
        extent: {
            width: notchInsLengthX - 2 * strokeWidth,
            height: notchInsLengthY,
        },
        coords: {
            x:
                strokeWidth +
                (_hasNotchArg ? notchArgLengthX : 0) +
                cornerRadius +
                notchInsOffsetX +
                strokeWidth,
            y: strokeWidth + notchInsLengthY - strokeWidth,
        },
    };
}

/**
 * Generates bounding box of the bottom instruction notch
 *
 * @private
 */
function _getBBoxNotchInsBot(): {
    extent: { width: number; height: number };
    coords: { x: number; y: number };
} {
    return {
        extent: {
            width: notchInsLengthX,
            height: notchInsLengthY,
        },
        coords: {
            x: 0,
            y: 0,
        },
    };
}

/**
 * Generates bounding box of the top instruction notch inside a nesting
 *
 * @private
 */
function _getBBoxNotchInsNestTop(): {
    extent: { width: number; height: number };
    coords: { x: number; y: number };
} {
    return {
        extent: {
            width: notchInsLengthX,
            height: notchInsLengthY,
        },
        coords: {
            x: 0,
            y: 0,
        },
    };
}

/**
 * Generates list of bounding boxes for each argument connector positioned on the right
 *
 * @private
 */
function _getBBoxArgs(): {
    extent: { width: number; height: number };
    coords: { x: number; y: number }[];
} {
    return {
        extent: {
            width: notchArgLengthX,
            height: notchArgLengthY,
        },
        coords: [
            {
                x: 0,
                y: 0,
            },
        ],
    };
}

// == public functions =============================================================================

/**
 * Generates SVG path along with information about the bounding boxes of notches and arguments.
 *
 * @remarks
 * Use https://yqnn.github.io/svg-path-editor/ to visualize the path
 *
 * @param options determines how the path looks
 * @param print whether to print results in the console (only to be used during development)
 */
export function generatePath(
    options:
        | {
              hasNest: true;
              hasNotchArg: boolean;
              hasNotchInsTop: boolean;
              hasNotchInsBot: boolean;
              scale: number;
              nestLengthY: number;
              innerLengthX: number;
              argHeights: number[];
          }
        | {
              hasNest: false;
              hasNotchArg: boolean;
              hasNotchInsTop: boolean;
              hasNotchInsBot: boolean;
              scale: number;
              innerLengthX: number;
              argHeights: number[];
          },
    print?: boolean,
): {
    /** path definition commands string */
    path: string;
    /** bounding box of the brick (actual area of the brick excluding notches) */
    bBoxBrick: {
        /** width and height of the brick */
        extent: { width: number; height: number };
        /** x and y co-ordinates of the brick relative to the origin of the SVG */
        coords: { x: number; y: number };
    };
    /** bounding box of the argument notch (on the left) */
    bBoxNotchArg: {
        /** width and height of the argument notch */
        extent: { width: number; height: number };
        /** x and y co-ordinates of the argument notch relative to the origin of the SVG */
        coords: { x: number; y: number };
    } | null;
    /** bounding box of the top instruction notch */
    bBoxNotchInsTop: {
        /** width and height of the top instruction notch */
        extent: { width: number; height: number };
        /** x and y co-ordinates of the top instruction notch relative to the origin of the SVG */
        coords: { x: number; y: number };
    } | null;
    /** bounding box of the bottom instruction notch */
    bBoxNotchInsBot: {
        /** width and height of the bottom instruction notch */
        extent: { width: number; height: number };
        /** x and y co-ordinates of the bottom instruction notch relative to the origin of the SVG */
        coords: { x: number; y: number };
    } | null;
    /** bounding box of the top instruction notch inside a nest (only for bricks with nesting) */
    bBoxNotchInsNestTop: {
        /** width and height of the top instruction notch inside a nest */
        extent: { width: number; height: number };
        /** x and y co-ordinates of the top instruction notch inside a nest relative to the origin of the SVG */
        coords: { x: number; y: number };
    } | null;
    /** list of bounding boxes for the argument connections */
    bBoxArgs: {
        /** width and height of each argument connection */
        extent: { width: number; height: number };
        /** list of x and y co-ordinates of each argument connection relative to the origin of the SVG */
        coords: { x: number; y: number }[];
    };
} {
    _setOptions(options);

    const results = {
        path: _getPath(),
        bBoxBrick: _getBBoxBrick(),
        bBoxNotchArg: _getBBoxNotchArg(),
        bBoxNotchInsTop: _getBBoxNotchInsTop(),
        bBoxNotchInsBot: _getBBoxNotchInsBot(),
        bBoxNotchInsNestTop: _getBBoxNotchInsNestTop(),
        bBoxArgs: _getBBoxArgs(),
    };

    if (print) console.log(results);
    console.log(results.path);

    return results;
}
