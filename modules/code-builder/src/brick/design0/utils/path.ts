const cornerRadius = 4;

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

let _hasNest = false;
let _hasNotchNest = false;
let _hasNotchArg = false;
let _hasNotchInsTop = false;
let _hasNotchInsBot = false;

let _scale = 1;
let _nestLengthY = nestLengthYMin;
let _innerLengthX = innerLengthXMin;
let _argsLengthY: number[] = [];

function _setOptions(options: {
    hasNest: boolean;
    hasNotchNest?: boolean;
    hasNotchArg: boolean;
    hasNotchInsTop: boolean;
    hasNotchInsBot: boolean;
    scale: number;
    nestLengthY?: number;
    innerLengthX: number;
    argHeights: number[];
}): void {
    _hasNest = options.hasNest;
    if (options.hasNotchNest) _hasNotchNest = options.hasNotchNest;

    _hasNotchArg = options.hasNotchArg;
    _hasNotchInsTop = options.hasNotchInsTop;
    _hasNotchInsBot = options.hasNotchInsBot;

    _scale = options.scale;
    if (options.nestLengthY) _nestLengthY = Math.max(nestLengthYMin, options.nestLengthY);
    _innerLengthX = Math.max(innerLengthXMin, options.innerLengthX);
    _argsLengthY = options.argHeights;
}

function _getPathTop() {
    const lineLengthX =
        _innerLengthX -
        cornerRadius * 2 -
        (_hasNotchInsTop ? notchInsOffsetX + notchInsLengthX : 0);

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

function _getPathBottom() {
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
        (_hasNotchInsTop ? notchInsOffsetX + notchInsLengthX : 0) -
        (_hasNest ? cornerRadius + notchInsOffsetX + 1 : 0);

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

function _getNotchArgInner() {
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

function _getNotchArgOuter() {
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

function _generateArgSection(options: {
    hasOffsetTop: boolean;
    hasOffsetBot: boolean;
    sectionLengthY: number;
}) {
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

function _getExtent(): {
    width: number;
    height: number;
} {
    return {
        width: _innerLengthX,
        height: _argsLengthY.reduce((a, b) => a + b, 0),
    };
}

function _getNotchInsBBox(): {
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

function _getNotchArgsBBox(): {
    extent: { width: number; height: number };
    coords: { x: number; y: number };
} {
    return {
        extent: {
            width: notchArgLengthX,
            height: notchArgLengthY - 2,
        },
        coords: {
            x: 0,
            y: 0,
        },
    };
}

function _getArgsBBox(): {
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

export function generatePath(
    options:
        | {
              hasNest: true;
              hasNotchNest: boolean;
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
): {
    path: string;
    extent: { width: number; height: number };
    notchInsBBox: {
        extent: { width: number; height: number };
        coords: { x: number; y: number };
    };
    notchArgsBBox: {
        extent: { width: number; height: number };
        coords: { x: number; y: number };
    };
    argsBBox: {
        extent: { width: number; height: number };
        coords: { x: number; y: number }[];
    };
} {
    _setOptions(options);

    return {
        path: _getPath(),
        extent: _getExtent(),
        notchInsBBox: _getNotchInsBBox(),
        notchArgsBBox: _getNotchArgsBBox(),
        argsBBox: _getArgsBBox(),
    };
}
