import { BrickModelSimple } from './model';
import type { IBrickSimple, TBrickRenderPropsSimple, TColor, TExtent } from '../@types/brick';
import { generatePath } from '../utils/path';

export default class SimpleBrick extends BrickModelSimple implements IBrickSimple {
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
    }) {
        super(params);

        const charWidth = 8;
        const fontHeight = 20;
        const bBoxLabel = {
            w: Math.max(40, params.label.length * charWidth),
            h: fontHeight,
        };

        this._pathResult = generatePath({
            type: 'type1',
            strokeWidth: this._strokeWidth,
            scaleFactor: this._scale,
            bBoxLabel,
            bBoxArgs: this._bboxArgs,
            hasNotchAbove: this._topNotch,
            hasNotchBelow: this._bottomNotch,
        });
    }

    public get boundingBox(): TExtent {
        return {
            w: Math.max(40, this._label.length * 8),
            h: 24,
        };
    }

    public override get renderProps(): TBrickRenderPropsSimple {
        return {
            ...this.getCommonRenderProps(),
            path: this._pathResult.path,
            topNotch: this._topNotch,
            bottomNotch: this._bottomNotch,
        };
    }
}
