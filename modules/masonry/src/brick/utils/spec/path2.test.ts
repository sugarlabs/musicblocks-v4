import type { BrickMinimums } from '@/@types/brick';

import { BrickOutlineGenerator } from '../path2';

class BrickOutlineGeneratorTest extends BrickOutlineGenerator {
    static readonly HEAD_PAD_Y1 = BrickOutlineGenerator.HEAD_PAD_Y1;
    static readonly HEAD_PAD_Y2 = BrickOutlineGenerator.HEAD_PAD_Y2;
    static readonly HEAD_PAD_X1 = BrickOutlineGenerator.HEAD_PAD_X1;
    static readonly HEAD_PAD_X2 = BrickOutlineGenerator.HEAD_PAD_X2;
    static readonly WIDGET_PARAM_GUTTER_X = BrickOutlineGenerator.WIDGET_PARAM_GUTTER_X;
    static readonly PARAM_GUTTER_Y = BrickOutlineGenerator.PARAM_GUTTER_Y;
    static readonly TAIL_INDENT_W = BrickOutlineGenerator.TAIL_INDENT_W;
    static readonly TAIL_STEP_W = BrickOutlineGenerator.TAIL_STEP_W;
    static readonly TAIL_STEP_H = BrickOutlineGenerator.TAIL_STEP_H;
    static readonly V_NOTCH_RADIUS = BrickOutlineGenerator.V_NOTCH_RADIUS;
    static readonly V_NOTCH_WIDTH = BrickOutlineGenerator.V_NOTCH_WIDTH;
    static readonly V_NOTCH_OFFSET_X = BrickOutlineGenerator.V_NOTCH_OFFSET_X;
    static readonly H_NOTCH_RADIUS = BrickOutlineGenerator.H_NOTCH_RADIUS;
    static readonly H_NOTCH_WIDTH = BrickOutlineGenerator.H_NOTCH_WIDTH;
    static readonly H_NOTCH_OFFSET_Y = BrickOutlineGenerator.H_NOTCH_OFFSET_Y;
    static readonly CORNER_RADIUS = BrickOutlineGenerator.CORNER_RADIUS;
}

const MINIMUMS: BrickMinimums = {
    minWidth: 100,
    minWidgetHeight: 20,
    minParamHeight: 20,
    minArgHeight: 40,
    minNestHeight: 40,
};

const brickOutlineGenerator = new BrickOutlineGeneratorTest(MINIMUMS);
