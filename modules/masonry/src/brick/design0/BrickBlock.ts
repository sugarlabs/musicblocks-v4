import type { TBrickRenderPropsBlock, TColor, TCoords, TExtent } from '@/@types/brick';
import { BrickModelBlock } from '../model';
import { generatePath } from '../utils/path';

// -------------------------------------------------------------------------------------------------

/**
 * @class
 * Final class that defines a block brick.
 */
export default class BrickBlock extends BrickModelBlock {
    readonly _pathResults: ReturnType<typeof generatePath>;

    private _boundingBoxArgs: Record<string, TExtent> = {};
    private _boundingBoxNest: TExtent = { width: 0, height: 0 };

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
        connectAbove: boolean;
        connectBelow: boolean;

        args: {
            /** unique identifier of the argument */
            id: string;
            /** label for the argument */
            label: string;
        }[];
    }) {
        super(params);

        this._pathResults = generatePath({
            hasNest: true,
            hasNotchArg: false,
            hasNotchInsTop: this._connectAbove,
            hasNotchInsBot: this._connectBelow,
            scale: this._scale,
            nestLengthY: this._args.length * 20, // Example of generating nest length based on argument count
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

    public get connPointsFixed(): Record<
        'insTop' | 'insBottom' | 'insNest',
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
            insNest: {
                extent: this._pathResults.bBoxNotchInsNestTop!.extent,
                coords: this._pathResults.bBoxNotchInsNestTop!.coords,
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

    public get renderProps(): TBrickRenderPropsBlock {
        return {
            path: this._pathResults.path,

            label: this._label,
            labelArgs: this._args.map(({ label }) => label),

            boundingBoxArgs: this._args.map(({ id }) => this._boundingBoxArgs[id]),
            boundingBoxNest: this._boundingBoxNest,

            glyph: this._glyph,
            colorBg: !this._highlighted ? this._colorBg : this._colorBgHighlight,
            colorFg: !this._highlighted ? this._colorFg : this._colorFgHighlight,
            outline: this._outline,
            scale: this._scale,
            folded: this.folded,
        };
    }

    public setBoundingBoxArg(id: string, extent: TExtent): void {
        this._boundingBoxArgs[id] = extent;
    }

    public setBoundingBoxNest(extent: TExtent): void {
        this._boundingBoxNest = extent;
    }

    public setHighlighted(highlighted: boolean): void {
        this._highlighted = highlighted;
    }
}
