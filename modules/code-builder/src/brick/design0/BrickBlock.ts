import type { TBrickArgDataType, TBrickColor, TBrickCoords, TBrickExtent } from '@/@types/brick';

import { BrickModelBlock } from '../model';

// -------------------------------------------------------------------------------------------------

/**
 * @class
 * Final class that defines a block brick.
 */
export default class BrickBlock extends BrickModelBlock {
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
        super(params);
    }

    public get extent(): TBrickExtent {
        return { width: 0, height: 0 };
    }

    public get argsCoords(): Record<string, TBrickCoords> {
        return {};
    }

    public get SVG(): string {
        const argsLength = Object.keys(this._args).length;
        const repeatPath = '21 '.repeat(argsLength - 1);

        return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
                <svg
                width="114"
                height="129"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:svg="http://www.w3.org/2000/svg"
                >
                <defs />
                <g transform="translate(-643,-379)">
                    <g transform="translate(643,379)">
                    <g transform="scale(${this._scale})">
                        <path
                        d="m 0.5,8.5 v -4 a 4,4 90 0 1 4,-4 h 4 v 2 h 10 v -2 h 9 40 4 a 4,4 90 0 1 4,4 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 
                                    v 17 h -4 v -3 h -4 v 10 h 4 v -3 h 4 
                                    v 17 h -4 v -3 h -4 v 10 h 4 v -3 h 4 
                                    v 4 a 4,4 90 0 1 -4,4 h -4 -40 -1 v 2 h -8 v -2 h -1 -4 a 5,5 90 0 0 -5,5 v 4 4 
                                    ${repeatPath}
                                    4 a 5,5 90 0 0 5,5 h 4 v 2 h 10 v -2 h 8 v 6 6 4 a 4,4 90 0 1 -4,4 h -4 -9 -1 v 2 h -8 v -2 h -1 -4 a 4,4 90 0 1 -4,-4 v -4 z"
                        style="
                            fill: ${this._colorBg};
                            fill-opacity: 1;
                            stroke: ${this._outline};
                            stroke-width: 1;
                            stroke-linecap: round;
                            stroke-opacity: 1;
                        "
                        />
                        <text
                        style="font-size: 10px; font-family: sans-serif; text-anchor: start; fill: ${this._colorFg};">
                        <tspan x="20" y="15">${this._label}</tspan>
                        </text>
                        <text
                        style="font-size: 6.66667px; font-family: sans-serif; text-anchor: end; fill: ${this._colorFg};">
                        <tspan x="65" y="12">${this._label}</tspan>
                        </text>
                    </g>
                    </g>
                </g>
                </svg>
                `;
    }
}
