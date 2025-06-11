import type { TBrickRenderPropsExpression, TColor, TCoords, TExtent } from '@/@types/brick';
import { BrickModelExpression } from '../model';
import { generatePath } from '../utils/path';

/**
 * @class
 * Final class that defines an expression brick.
 */
export default class BrickExpression extends BrickModelExpression {
    readonly _pathResults: ReturnType<typeof generatePath>;

    private _boundingBoxArgs: Record<string, TExtent> = {};

    constructor(params: {
        uuid: string;
        name: string;
        label: string;
        glyph?: string;
        colorBg: TColor;
        colorFg: TColor;
        colorBgHighlight: TColor;
        colorFgHighlight: TColor;
        outline: TColor;
        args: { id: string; label: string }[];
    }) {
        super(params);

        this._pathResults = generatePath({
            hasNest: false,
            hasNotchArg: true,
            hasNotchInsTop: false,
            hasNotchInsBot: false,
            scale: this._scale,
            innerLengthX: 100,
            argHeights: Array.from({ length: this._args.length }, () => 17),
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

    public get renderProps(): TBrickRenderPropsExpression {
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

    public setHighlighted(highlighted: boolean): void {
        this._highlighted = highlighted;
    }
}
