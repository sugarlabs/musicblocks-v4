import type { TBrickArgDataType, TBrickColor, TBrickCoords, TBrickExtent } from '@/@types/brick';

import { BrickModelExpression } from '../model';
import { generatePath } from './utils/path';

// -------------------------------------------------------------------------------------------------

/**
 * @class
 * Final class that defines a expression brick.
 */
export default class BrickExpression extends BrickModelExpression {
    constructor(params: {
        // intrinsic
        name: string;
        label: string;
        glyph: string;
        dataType: TBrickArgDataType;
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
            hasNotchArg: true,
            hasNotchInsTop: false,
            hasNotchInsBot: false,
            scale: this._scale,
            innerLengthX: this.labelWidth,
            argHeights: Array.from({ length: argsLength }, () => 17),
        }).path;

        result.push(path);

        return result;
    }
}
