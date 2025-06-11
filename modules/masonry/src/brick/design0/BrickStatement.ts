import type { TBrickRenderPropsStatement, TColor, TCoords, TExtent } from '@/@types/brick';
import { BrickModelStatement } from '../model';
import { generatePath } from '../utils/path';

/**
 * @class
 * Final class that defines a statement brick.
 */
export default class BrickStatement extends BrickModelStatement {
    readonly _pathResults: ReturnType<typeof generatePath>;

    private _boundingBoxArgs: Record<string, TExtent> = {};

    constructor(params: {
        uuid: string;
        name: string;
        label: string;
        glyph: string;
        args: { id: string; label: string }[];
        colorBg: TColor;
        colorFg: TColor;
        colorBgHighlight: TColor;
        colorFgHighlight: TColor;
        outline: TColor;
        scale: number;
        connectAbove: boolean;
        connectBelow: boolean;
    }) {
        super(params);

        this._pathResults = generatePath({
            hasNest: false,
            hasNotchArg: false,
            hasNotchInsTop: params.connectAbove,
            hasNotchInsBot: params.connectBelow,
            scale: this._scale,
            innerLengthX: 100,
            argHeights: Array.from({ length: params.args.length }, () => 17),
        });
    }

    public get boundingBox(): TExtent {
        return {
            width: this._pathResults.bBoxBrick.extent.width,
            height: this._pathResults.bBoxBrick.extent.height,
        };
    }

    public get connPointsFixed(): Record<
        'insTop' | 'insBottom',
        { extent: TExtent; coords: TCoords }
    > {
        return {
            insTop: {
                extent: this._pathResults.bBoxNotchInsTop!.extent,
                coords: this._pathResults.bBoxNotchInsTop!.coords,
            },
            insBottom: {
                extent: this._pathResults.bBoxNotchInsBot!.extent,
                coords: this._pathResults.bBoxNotchInsBot!.coords,
            },
        };
    }

    public get connPointsArg(): { [id: string]: { extent: TExtent; coords: TCoords } } {
        const results: { [id: string]: { extent: TExtent; coords: TCoords } } = {};

        this._args.forEach(({ id }, index) => {
            results[id] = {
                extent: { width: 10, height: 10 }, // Example extent
                coords: { x: 0, y: index * 20 }, // Example coordinates calculation
            };
        });

        return results;
    }

    public get renderProps(): TBrickRenderPropsStatement {
        return {
            path: this._pathResults.path,
            label: this._label,
            labelArgs: this._args.map(({ label }) => label),
            boundingBoxArgs: this._args.map(({ id }) => this._boundingBoxArgs[id]),
            glyph: this._glyph,
            colorBg: !this._highlighted ? this._colorBg : this._colorBgHighlight,
            colorFg: !this._highlighted ? this._colorFg : this._colorFgHighlight,
            outline: this._outline,
            scale: this._scale,
        };
    }

    public setBoundingBoxArg(id: string, extent: TExtent): void {
        this._boundingBoxArgs[id] = extent;
    }

    public setConnectAbove(connectAbove: boolean): void {
        this._connectAbove = connectAbove;
    }

    public setConnectBelow(connectBelow: boolean): void {
        this._connectBelow = connectBelow;
    }

    public setHighlighted(highlighted: boolean): void {
        this._highlighted = highlighted;
    }
}
