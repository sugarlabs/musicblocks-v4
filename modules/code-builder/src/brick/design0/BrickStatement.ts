import type { TBrickArgDataType, TBrickColor, TBrickCoords, TBrickExtent } from '@/@types/brick';

import { BrickModelStatement } from '../model';
import { generatePath } from './utils/path';

// -------------------------------------------------------------------------------------------------

/**
 * @class
 * Final class that defines a statement brick.
 */
export default class BrickStatement extends BrickModelStatement {
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

    public get SVGpaths(): string[] {
        const argsLength = Object.keys(this._args).length;
        let result: string[] = [];

        const path = generatePath({
            hasNest: false,
            hasNotchArg: false,
            hasNotchInsTop: true,
            hasNotchInsBot: true,
            scale: this._scale,
            innerLengthX: this.labelWidth,
            argHeights: Array.from({ length: argsLength }, () => 17),
        }).path;

        result.push(path);

        return result;
    }
}
