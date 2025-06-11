import type { TBrickRenderPropsData, TColor, TCoords, TExtent } from '@/@types/brick';
import { BrickModelData } from '../model';
import { generatePath } from '../utils/path';

/**
 * @class
 * Final class that defines a data brick.
 */
export default class BrickData extends BrickModelData {
    readonly _pathResults: ReturnType<typeof generatePath>;

    constructor(params: {
        uuid: string;
        name: string;
        label: string;
        glyph: string;
        colorBg: TColor;
        colorFg: TColor;
        colorBgHighlight: TColor;
        colorFgHighlight: TColor;
        outline: TColor;
        dynamic: boolean;
        value?: boolean | number | string;
        input?: 'boolean' | 'number' | 'string' | 'options';
    }) {
        super(params);

        this._pathResults = generatePath({
            hasNest: false,
            hasNotchArg: true,
            hasNotchInsTop: false,
            hasNotchInsBot: false,
            scale: this._scale,
            innerLengthX: 100,
            argHeights: [],
        });
    }

    public get boundingBox(): TExtent {
        return {
            width: this._pathResults.bBoxBrick.extent.width,
            height: this._pathResults.bBoxBrick.extent.height,
        };
    }

    public get connPointsFixed(): Record<'argOutgoing', { extent: TExtent; coords: TCoords }> {
        return {
            argOutgoing: {
                extent: this._pathResults.bBoxNotchArg!.extent,
                coords: this._pathResults.bBoxNotchArg!.coords,
            },
        };
    }

    public get renderProps(): TBrickRenderPropsData {
        return {
            path: this._pathResults.path,
            label: this._label,
            glyph: this._glyph,
            colorBg: !this._highlighted ? this._colorBg : this._colorBgHighlight,
            colorFg: !this._highlighted ? this._colorFg : this._colorFgHighlight,
            outline: this._outline,
            scale: this._scale,
        };
    }

    public setDynamic(dynamic: boolean): void {
        this._dynamic = dynamic;
    }

    public setValue(value: boolean | number | string): void {
        this._value = value;
    }

    public setInput(input: 'boolean' | 'number' | 'string' | 'options'): void {
        this._input = input;
    }

    public setHighlighted(highlighted: boolean): void {
        this._highlighted = highlighted;
    }
}
