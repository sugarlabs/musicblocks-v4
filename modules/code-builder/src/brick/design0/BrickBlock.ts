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
        return '';
    }
}
