import { BrickModelCompound } from './model';
import type { IBrickCompound, TBrickRenderPropsCompound, TColor, TExtent } from '../@types/brick';
import { generatePath } from '../utils/path';

export default class CompoundBrick extends BrickModelCompound implements IBrickCompound {
    private readonly _pathResult: ReturnType<typeof generatePath>;

    constructor(params: {
        uuid: string;
        name: string;
        label: string;
        labelType: 'text' | 'glyph' | 'icon' | 'thumbnail';
        colorBg: TColor;
        colorFg: TColor;
        strokeColor: TColor;
        shadow: boolean;
        isHighlighted: boolean;
        tooltip?: string;
        scale: number;

        topNotch: boolean;
        bottomNotch: boolean;

        bboxArgs: TExtent[];
        bboxNest: TExtent[];
    }) {
        const { bboxArgs, bboxNest, ...common } = params;

        super({
            ...common,
            bboxArgs: bboxArgs,
            bboxNest,
        });

        const charWidth = 8;
        const fontHeight = 20;
        const bBoxLabel = {
            w: Math.max(40, params.label.length * charWidth),
            h: fontHeight,
        };

        this._pathResult = generatePath({
            type: 'type3',
            strokeWidth: this._strokeWidth,
            scaleFactor: this._scale,
            bBoxLabel,
            bBoxArgs: this._bboxArgs,
            hasNotchAbove: this._topNotch,
            hasNotchBelow: this._bottomNotch,
            bBoxNesting: this._bboxNest,
            secondaryLabel: false,
        });
    }

    /** Placeholder bounding-box until generatePath gives you the real one */
    public get boundingBox(): TExtent {
        return {
            w: Math.max(40, this._label.length * 8),
            h: Math.max(
                40,
                this._bboxNest.reduce((sum, b) => sum + b.h, 0),
            ),
        };
    }

    public override get renderProps(): TBrickRenderPropsCompound {
        return {
            ...this.getCommonRenderProps(),
            path: this._pathResult.path,
            topNotch: this._topNotch,
            bottomNotch: this._bottomNotch,
            bboxArgs: this._bboxArgs,
            bboxNest: this._bboxNest,
            isFolded: this._isFolded,
        };
    }
}
