import type {
    TBrickArgDataType,
    TBrickColor,
    TBrickCoords,
    TBrickExtent,
    TBrickKind,
    TBrickType,
} from '@/@types/brick';

import { BrickModelStatement } from '../model';

// -------------------------------------------------------------------------------------------------

/**
 * @class
 * Final class that defines a statement brick.
 */
export default class BrickStatement extends BrickModelStatement {
    constructor(params: {
        // intrinsic
        uuid: string;
        name: string;
        kind: TBrickKind;
        type: TBrickType;
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
