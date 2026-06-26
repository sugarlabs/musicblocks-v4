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

describe('computeDimensions', () => {
    // Use a realistic stroke width throughout; strokeWidth/2 bleeds into every dimension
    // that has a stroke-inset at each end.
    const strokeWidth = 2;

    describe('head width', () => {
        it('no params: headWidth = strokeWidth + HEAD_PAD_X1 + labelWidth + HEAD_PAD_X2', () => {
            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 200, h: 20 },
                paramArgDims: [],
            });

            expect(dims.headWidth).toBe(
                strokeWidth +
                    BrickOutlineGeneratorTest.HEAD_PAD_X1 +
                    200 +
                    BrickOutlineGeneratorTest.HEAD_PAD_X2,
            );
        });

        it('single param: adds WIDGET_PARAM_GUTTER_X + param width', () => {
            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 100, h: 20 },
                paramArgDims: [{ param: { w: 80, h: 20 }, arg: null }],
            });

            expect(dims.headWidth).toBe(
                strokeWidth +
                    BrickOutlineGeneratorTest.HEAD_PAD_X1 +
                    100 +
                    BrickOutlineGeneratorTest.WIDGET_PARAM_GUTTER_X +
                    80 +
                    BrickOutlineGeneratorTest.HEAD_PAD_X2,
            );
        });

        it('multiple params: uses max param width, not sum', () => {
            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 100, h: 20 },
                paramArgDims: [
                    { param: { w: 60, h: 20 }, arg: null },
                    { param: { w: 40, h: 20 }, arg: null },
                ],
            });

            // maxParamWidth = 60, not 60+40=100
            expect(dims.headWidth).toBe(
                strokeWidth +
                    BrickOutlineGeneratorTest.HEAD_PAD_X1 +
                    100 +
                    BrickOutlineGeneratorTest.WIDGET_PARAM_GUTTER_X +
                    60 +
                    BrickOutlineGeneratorTest.HEAD_PAD_X2,
            );
        });
    });

    describe('tail width', () => {
        it('no nesting: tailWidth is 0', () => {
            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 10, h: 20 },
                paramArgDims: [],
            });

            expect(dims.tailWidth).toBe(0);
        });

        it('nesting width at crossover (TAIL_STEP_W - TAIL_INDENT_W): tailStepWidth still wins', () => {
            const nestW =
                // 40 — tied, step wins by max
                BrickOutlineGeneratorTest.TAIL_STEP_W - BrickOutlineGeneratorTest.TAIL_INDENT_W;

            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 10, h: 20 },
                paramArgDims: [],
                nestingDims: { w: nestW, h: 40 },
            });

            // tailIndentWidth = sw+8+40 = 50 = tailStepWidth = sw+48 = 50 → tied, max picks either
            expect(dims.tailWidth).toBe(strokeWidth + BrickOutlineGeneratorTest.TAIL_STEP_W);
        });

        it('nesting wider than crossover: tailIndentWidth wins', () => {
            const nestW =
                // 41 — indent pulls ahead
                BrickOutlineGeneratorTest.TAIL_STEP_W - BrickOutlineGeneratorTest.TAIL_INDENT_W + 1;

            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 10, h: 20 },
                paramArgDims: [],
                nestingDims: { w: nestW, h: 40 },
            });

            // tailIndentWidth = sw+8+41 = 51 > tailStepWidth = sw+48 = 50
            expect(dims.tailWidth).toBe(
                strokeWidth + BrickOutlineGeneratorTest.TAIL_INDENT_W + nestW,
            );
        });
    });

    describe('nest width', () => {
        // nestWidth is nestingDims.w verbatim — no strokeWidth term.
        it('no nesting: nestWidth is 0', () => {
            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 10, h: 20 },
                paramArgDims: [],
            });

            expect(dims.nestWidth).toBe(0);
        });

        it('nesting with null dims: nestWidth is 0', () => {
            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 10, h: 20 },
                paramArgDims: [],
                nestingDims: null,
            });

            expect(dims.nestWidth).toBe(0);
        });

        it('nesting with known width: nestWidth equals nestingDims.w', () => {
            const nestW = 60;
            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 10, h: 20 },
                paramArgDims: [],
                nestingDims: { w: nestW, h: 40 },
            });

            expect(dims.nestWidth).toBe(nestW);
        });
    });

    describe('overall width', () => {
        it('headWidth dominates when label is wide enough to beat tail and minWidth', () => {
            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 200, h: 20 },
                paramArgDims: [],
            });

            // headWidth=226, tailWidth=0, minWidth=100 → 226
            expect(dims.width).toBe(
                strokeWidth +
                    BrickOutlineGeneratorTest.HEAD_PAD_X1 +
                    200 +
                    BrickOutlineGeneratorTest.HEAD_PAD_X2,
            );
        });

        it('tailWidth dominates when nesting is wide enough to beat head and minWidth', () => {
            const nestW = 100;
            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 10, h: 20 },
                paramArgDims: [],
                nestingDims: { w: nestW, h: 40 },
            });

            // headWidth=36, tailWidth=110, minWidth=100 → 110
            expect(dims.width).toBe(strokeWidth + BrickOutlineGeneratorTest.TAIL_INDENT_W + nestW);
        });

        it('minWidth dominates when both head and tail are narrower', () => {
            const minWidth = 120;
            const brickOutlineGenerator = new BrickOutlineGeneratorTest({ ...MINIMUMS, minWidth });

            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 20, h: 20 },
                paramArgDims: [],
            });

            // headWidth=46, tailWidth=0, minWidth=120 → 120
            expect(dims.width).toBe(minWidth);
        });
    });

    describe('head height', () => {
        it('widget drives headHeight when taller than params and args', () => {
            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 100, h: 60 },
                paramArgDims: [],
            });

            // headHeightByWidget = strokeWidth + HEAD_PAD_Y1 + 60 + HEAD_PAD_Y2 = 74
            expect(dims.headHeight).toBe(
                strokeWidth +
                    BrickOutlineGeneratorTest.HEAD_PAD_Y1 +
                    60 +
                    BrickOutlineGeneratorTest.HEAD_PAD_Y2,
            );
        });

        it('params drive headHeight when stacked params exceed widget height', () => {
            const paramH = 40;
            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 100, h: 20 },
                paramArgDims: [
                    { param: { w: 50, h: paramH }, arg: null },
                    { param: { w: 50, h: paramH }, arg: null },
                ],
            });

            // paramsTotalHeight=80, paramGutterTotal=PARAM_GUTTER_Y=12
            // headHeightByParams = strokeWidth + HEAD_PAD_Y1 + 80 + 12 + HEAD_PAD_Y2 = 106
            expect(dims.headHeight).toBe(
                strokeWidth +
                    BrickOutlineGeneratorTest.HEAD_PAD_Y1 +
                    2 * paramH +
                    BrickOutlineGeneratorTest.PARAM_GUTTER_Y +
                    BrickOutlineGeneratorTest.HEAD_PAD_Y2,
            );
        });

        it('args drive headHeight when an arg slot exceeds widget and param height', () => {
            const argH = 80;
            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 100, h: 20 },
                paramArgDims: [{ param: null, arg: { w: 50, h: argH } }],
            });

            // headHeightByArgs = max(80, minArgHeight=40) = 80 (no strokeWidth term)
            expect(dims.headHeight).toBe(argH);
        });

        it('minWidgetHeight is enforced when widget is shorter than minimum', () => {
            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 100, h: 10 },
                paramArgDims: [],
            });

            // headHeightByWidget = strokeWidth + HEAD_PAD_Y1 + max(10, minWidgetHeight=20) + HEAD_PAD_Y2 = 34
            expect(dims.headHeight).toBe(
                strokeWidth +
                    BrickOutlineGeneratorTest.HEAD_PAD_Y1 +
                    MINIMUMS.minWidgetHeight +
                    BrickOutlineGeneratorTest.HEAD_PAD_Y2,
            );
        });
    });

    describe('nest height', () => {
        // nestHeight is max(nestingDims.h, minNestHeight) — no strokeWidth term.
        it('no nesting: nestHeight is 0', () => {
            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 10, h: 20 },
                paramArgDims: [],
            });

            expect(dims.nestHeight).toBe(0);
        });

        it('null nesting dims: nestHeight falls back to minNestHeight', () => {
            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 10, h: 20 },
                paramArgDims: [],
                nestingDims: null,
            });

            expect(dims.nestHeight).toBe(MINIMUMS.minNestHeight);
        });

        it('known height below minimum: nestHeight is clamped to minNestHeight', () => {
            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 10, h: 20 },
                paramArgDims: [],
                nestingDims: { w: 10, h: 20 },
            });

            // max(20, minNestHeight=40) = 40
            expect(dims.nestHeight).toBe(MINIMUMS.minNestHeight);
        });

        it('known height above minimum: nestHeight equals nestingDims.h', () => {
            const nestH = 60;
            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 10, h: 20 },
                paramArgDims: [],
                nestingDims: { w: 10, h: nestH },
            });

            expect(dims.nestHeight).toBe(nestH);
        });
    });

    describe('tail height', () => {
        it('no nesting: tailHeight is 0', () => {
            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 10, h: 20 },
                paramArgDims: [],
            });

            expect(dims.tailHeight).toBe(0);
        });

        it('with nesting: tailHeight = nestHeight + strokeWidth + TAIL_STEP_H', () => {
            const nestH = 60;
            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 10, h: 20 },
                paramArgDims: [],
                nestingDims: { w: 10, h: nestH },
            });

            // nestHeight=60, tailHeight = 60 + strokeWidth + TAIL_STEP_H = 74
            expect(dims.tailHeight).toBe(
                nestH + strokeWidth + BrickOutlineGeneratorTest.TAIL_STEP_H,
            );
        });
    });

    describe('overall height', () => {
        it('no nesting: height equals headHeight', () => {
            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 100, h: 60 },
                paramArgDims: [],
            });

            // headHeight=74, tailHeight=0 → 74
            expect(dims.height).toBe(
                strokeWidth +
                    BrickOutlineGeneratorTest.HEAD_PAD_Y1 +
                    60 +
                    BrickOutlineGeneratorTest.HEAD_PAD_Y2,
            );
        });

        it('with nesting: height equals headHeight + tailHeight', () => {
            const nestH = 60;
            const dims = brickOutlineGenerator.computeDimensions({
                strokeWidth,
                widgetDims: { w: 100, h: 20 },
                paramArgDims: [],
                nestingDims: { w: 10, h: nestH },
            });

            // headHeight=34, nestHeight=60, tailHeight=74 → 108
            expect(dims.height).toBe(
                strokeWidth +
                    BrickOutlineGeneratorTest.HEAD_PAD_Y1 +
                    MINIMUMS.minWidgetHeight +
                    BrickOutlineGeneratorTest.HEAD_PAD_Y2 +
                    nestH +
                    strokeWidth +
                    BrickOutlineGeneratorTest.TAIL_STEP_H,
            );
        });
    });
});
