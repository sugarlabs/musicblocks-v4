import { BrickModelExpression } from './model';
import type {
    IBrickExpression,
    TBrickRenderPropsExpression,
    TExtent,
    TColor,
} from '../@types/brick';
import { generatePath } from '../utils/path';

export default class ExpressionBrick extends BrickModelExpression implements IBrickExpression {
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
        scale: number;
        tooltip?: string;
        hasContextMenu?: boolean;

        value?: boolean | number | string | undefined;
        isValueSelectOpen?: boolean;
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
            type: 'type2',
            strokeWidth: this._strokeWidth,
            scaleFactor: this._scale,
            bBoxLabel,
            bBoxArgs: this._bboxArgs,
        });
    }

    public get boundingBox(): TExtent {
        // TODO: Replace with _pathResult.boundingBox when generatePath returns it
        return {
            w: Math.max(40, this._label.length * 8),
            h: 32,
        };
    }

    public override get renderProps(): TBrickRenderPropsExpression {
        return {
            ...this.getCommonRenderProps(),
            path: this._pathResult.path,
            value: this._value,
            isValueSelectOpen: this._isValueSelectOpen,
        };
    }
}
