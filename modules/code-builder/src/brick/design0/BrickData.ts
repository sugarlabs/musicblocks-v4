import type { TBrickArgDataType, TBrickColor, TBrickExtent } from '@/@types/brick';

import { BrickModelData } from '../model';

// -------------------------------------------------------------------------------------------------

/**
 * @class
 * Final class that defines a data brick.
 */
export default class BrickData extends BrickModelData {
    constructor(params: {
        // intrinsic
        name: string;
        label: string;
        glyph: string;
        dataType: TBrickArgDataType;
        dynamic: boolean;
        value?: boolean | number | string;
        input?: 'boolean' | 'number' | 'string' | 'options';
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

    public get SVG(): string {
        return '';
    }
}
