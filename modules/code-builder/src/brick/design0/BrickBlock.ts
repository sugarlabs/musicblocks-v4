import type { TBrickArgDataType, TBrickColor, TBrickCoords, TBrickExtent } from '@/@types/brick';

import { BrickModelBlock } from '../model';
import { generatePath } from './utils/path';

// -------------------------------------------------------------------------------------------------

/**
 * @class
 * Final class that defines a block brick.
 */
export default class BrickBlock extends BrickModelBlock {
    readonly _pathResults: ReturnType<typeof generatePath>;

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
        const argsKeys = Object.keys(this._args);
        this._pathResults = generatePath({
            hasNest: true,
            hasNotchArg: true,
            hasNotchInsTop: this._connectAbove,
            hasNotchInsBot: this._connectBelow,
            scale: this._scale,
            nestLengthY: 30,
            innerLengthX: 100,
            argHeights: Array.from({ length: argsKeys.length }, () => 17),
        });
    }

    public get extent(): TBrickExtent {
        return this._pathResults.bBoxBrick.extent;
    }

    public get bBoxArgs(): Record<string, { extent: TBrickExtent; coords: TBrickCoords }> {
        const argsKeys = Object.keys(this._args);
        const result: Record<string, { extent: TBrickExtent; coords: TBrickCoords }> = {};

        argsKeys.forEach((key, index) => {
            result[key] = { extent: { width: 0, height: 0 }, coords: { x: 0, y: 0 } };
            const argX = this._pathResults.bBoxArgs.coords[index].x;
            const argY = this._pathResults.bBoxArgs.coords[index].y;

            result[key].extent = this._pathResults.bBoxArgs.extent;
            result[key].coords = { x: argX, y: argY };
        });

        return result;
    }

    public get SVGpaths(): string[] {
        let result: string[] = [];

        const path = this._pathResults.path;
        result.push(path);

        return result;
    }
}
