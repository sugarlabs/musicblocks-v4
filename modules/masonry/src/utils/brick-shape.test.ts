import type { BrickMinimums } from '@/@types/brick.types';

import { BrickOutlineGenerator } from './brick-shape';

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

describe('generate', () => {
    const strokeWidth = 2;

    describe('return shape', () => {
        it('returns path, width, height, and bounds', () => {
            const result = brickOutlineGenerator.generate({
                strokeWidth,
                widgetDims: { w: 100, h: 20 },
                paramArgDims: [],
            });

            expect(result).toHaveProperty('path');
            expect(result).toHaveProperty('width');
            expect(result).toHaveProperty('height');
            expect(result).toHaveProperty('bounds');
        });

        it('width and height match computeDimensions for the same input', () => {
            const input = {
                strokeWidth,
                widgetDims: { w: 100, h: 20 },
                paramArgDims: [],
            };
            const dims = brickOutlineGenerator.computeDimensions(input);
            const result = brickOutlineGenerator.generate(input);

            expect(result.width).toBe(dims.width);
            expect(result.height).toBe(dims.height);
        });
    });

    describe('SVG path structure', () => {
        it('path starts with M and ends with Z (no nesting)', () => {
            const { path } = brickOutlineGenerator.generate({
                strokeWidth,
                widgetDims: { w: 100, h: 20 },
                paramArgDims: [],
            });

            expect(path).toMatch(/^M /);
            expect(path).toMatch(/Z$/);
        });

        it('path starts with M and ends with Z (with nesting)', () => {
            const { path } = brickOutlineGenerator.generate({
                strokeWidth,
                widgetDims: { w: 100, h: 20 },
                paramArgDims: [],
                nestingDims: { w: 50, h: 40 },
            });

            expect(path).toMatch(/^M /);
            expect(path).toMatch(/Z$/);
        });

        it('path contains exactly one Z (no nesting)', () => {
            const { path } = brickOutlineGenerator.generate({
                strokeWidth,
                widgetDims: { w: 100, h: 20 },
                paramArgDims: [],
            });

            expect((path.match(/Z/g) ?? []).length).toBe(1);
        });

        it('path contains exactly one Z (with nesting)', () => {
            const { path } = brickOutlineGenerator.generate({
                strokeWidth,
                widgetDims: { w: 100, h: 20 },
                paramArgDims: [],
                nestingDims: { w: 50, h: 40 },
            });

            expect((path.match(/Z/g) ?? []).length).toBe(1);
        });
    });

    describe('path changes with flags', () => {
        it('hasPrevNotch: true produces a different path than false', () => {
            const base = { strokeWidth, widgetDims: { w: 100, h: 20 }, paramArgDims: [] };
            const without = brickOutlineGenerator.generate({ ...base, hasPrevNotch: false });
            const with_ = brickOutlineGenerator.generate({ ...base, hasPrevNotch: true });

            expect(with_.path).not.toBe(without.path);
        });

        it('hasNextNotch: true produces a different path than false', () => {
            const base = { strokeWidth, widgetDims: { w: 100, h: 20 }, paramArgDims: [] };
            const without = brickOutlineGenerator.generate({ ...base, hasNextNotch: false });
            const with_ = brickOutlineGenerator.generate({ ...base, hasNextNotch: true });

            expect(with_.path).not.toBe(without.path);
        });

        it('hasOutputNotch: true produces a different path than false', () => {
            const base = { strokeWidth, widgetDims: { w: 100, h: 20 }, paramArgDims: [] };
            const without = brickOutlineGenerator.generate({ ...base, hasOutputNotch: false });
            const with_ = brickOutlineGenerator.generate({ ...base, hasOutputNotch: true });

            expect(with_.path).not.toBe(without.path);
        });

        it('nestingDims present produces a different path than absent', () => {
            const base = { strokeWidth, widgetDims: { w: 100, h: 20 }, paramArgDims: [] };
            const without = brickOutlineGenerator.generate(base);
            const with_ = brickOutlineGenerator.generate({
                ...base,
                nestingDims: { w: 50, h: 40 },
            });

            expect(with_.path).not.toBe(without.path);
        });
    });

    describe('bounds', () => {
        describe('widget', () => {
            it('widget bound x and y account for stroke and padding', () => {
                const { bounds } = brickOutlineGenerator.generate({
                    strokeWidth,
                    widgetDims: { w: 100, h: 20 },
                    paramArgDims: [],
                });

                expect(bounds.widget.x).toBe(
                    strokeWidth / 2 + BrickOutlineGeneratorTest.HEAD_PAD_X1,
                );
                expect(bounds.widget.y).toBe(
                    strokeWidth / 2 + BrickOutlineGeneratorTest.HEAD_PAD_Y1,
                );
            });

            it('widget bound width equals input widgetDims.w', () => {
                const { bounds } = brickOutlineGenerator.generate({
                    strokeWidth,
                    widgetDims: { w: 123, h: 20 },
                    paramArgDims: [],
                });

                expect(bounds.widget.w).toBe(123);
            });

            it('widget bound height is clamped to minWidgetHeight when input is shorter', () => {
                const { bounds } = brickOutlineGenerator.generate({
                    strokeWidth,
                    widgetDims: { w: 100, h: 5 },
                    paramArgDims: [],
                });

                expect(bounds.widget.h).toBe(MINIMUMS.minWidgetHeight);
            });

            it('widget bound height reflects input when taller than minimum', () => {
                const widgetH = 60;
                const { bounds } = brickOutlineGenerator.generate({
                    strokeWidth,
                    widgetDims: { w: 100, h: widgetH },
                    paramArgDims: [],
                });

                expect(bounds.widget.h).toBe(widgetH);
            });
        });

        describe('params and args', () => {
            it('no param/arg rows: bounds.params and bounds.args are both undefined', () => {
                const { bounds } = brickOutlineGenerator.generate({
                    strokeWidth,
                    widgetDims: { w: 100, h: 20 },
                    paramArgDims: [],
                });

                expect(bounds.params).toBeUndefined();
                expect(bounds.args).toBeUndefined();
            });

            it('param-only row: bounds.params has one entry, bounds.args is undefined', () => {
                const { bounds } = brickOutlineGenerator.generate({
                    strokeWidth,
                    widgetDims: { w: 100, h: 20 },
                    paramArgDims: [{ param: { w: 50, h: 20 }, arg: null }],
                });

                expect(bounds.params).toHaveLength(1);
                expect(bounds.args).toBeUndefined();
            });

            it('arg-only row: bounds.args has one entry at x=width, bounds.params is undefined', () => {
                const result = brickOutlineGenerator.generate({
                    strokeWidth,
                    widgetDims: { w: 100, h: 20 },
                    paramArgDims: [{ param: null, arg: { w: 50, h: 40 } }],
                });

                expect(result.bounds.args).toHaveLength(1);
                expect(result.bounds.args![0]!.x).toBe(result.width);
                expect(result.bounds.params).toBeUndefined();
            });

            it('param+arg row: both arrays have one entry', () => {
                const { bounds } = brickOutlineGenerator.generate({
                    strokeWidth,
                    widgetDims: { w: 100, h: 20 },
                    paramArgDims: [{ param: { w: 50, h: 20 }, arg: { w: 50, h: 40 } }],
                });

                expect(bounds.params).toHaveLength(1);
                expect(bounds.args).toHaveLength(1);
            });

            it('row with param: null produces a null entry in bounds.params', () => {
                const { bounds } = brickOutlineGenerator.generate({
                    strokeWidth,
                    widgetDims: { w: 100, h: 20 },
                    paramArgDims: [
                        { param: { w: 50, h: 20 }, arg: { w: 50, h: 40 } },
                        { param: null, arg: { w: 50, h: 40 } },
                    ],
                });

                expect(bounds.params).toHaveLength(2);
                expect(bounds.params![1]).toBeNull();
            });

            it('row with arg: null produces a null entry in bounds.args', () => {
                const { bounds } = brickOutlineGenerator.generate({
                    strokeWidth,
                    widgetDims: { w: 100, h: 20 },
                    paramArgDims: [
                        { param: { w: 50, h: 20 }, arg: { w: 50, h: 40 } },
                        { param: { w: 50, h: 20 }, arg: null },
                    ],
                });

                expect(bounds.args).toHaveLength(2);
                expect(bounds.args![1]).toBeNull();
            });
        });

        describe('nesting', () => {
            it('no nesting: bounds.nesting is undefined', () => {
                const { bounds } = brickOutlineGenerator.generate({
                    strokeWidth,
                    widgetDims: { w: 100, h: 20 },
                    paramArgDims: [],
                });

                expect(bounds.nesting).toBeUndefined();
            });

            it('with nesting: bounds.nesting.y equals headHeight', () => {
                const input = {
                    strokeWidth,
                    widgetDims: { w: 100, h: 20 },
                    paramArgDims: [],
                    nestingDims: { w: 50, h: 40 },
                };
                const dims = brickOutlineGenerator.computeDimensions(input);
                const result = brickOutlineGenerator.generate(input);

                expect(result.bounds.nesting!.y).toBe(dims.headHeight);
            });

            it('with nesting: bounds.nesting.x equals TAIL_INDENT_W + strokeWidth', () => {
                const { bounds } = brickOutlineGenerator.generate({
                    strokeWidth,
                    widgetDims: { w: 100, h: 20 },
                    paramArgDims: [],
                    nestingDims: { w: 50, h: 40 },
                });

                expect(bounds.nesting!.x).toBe(
                    BrickOutlineGeneratorTest.TAIL_INDENT_W + strokeWidth,
                );
            });
        });
    });

    describe('caching', () => {
        it('consecutive calls with identical input return consistent dimensions', () => {
            const gen = new BrickOutlineGeneratorTest(MINIMUMS);
            const input = {
                strokeWidth,
                widgetDims: { w: 100, h: 20 },
                paramArgDims: [],
            };
            const first = gen.generate(input);
            const second = gen.generate(input);

            expect(second.width).toBe(first.width);
            expect(second.height).toBe(first.height);
        });

        it('changed input updates the returned dimensions', () => {
            const gen = new BrickOutlineGeneratorTest(MINIMUMS);
            const first = gen.generate({
                strokeWidth,
                widgetDims: { w: 50, h: 20 },
                paramArgDims: [],
            });
            const second = gen.generate({
                strokeWidth,
                widgetDims: { w: 200, h: 20 },
                paramArgDims: [],
            });

            expect(second.width).toBeGreaterThan(first.width);
        });
    });
});

describe('getConnectorCoords', () => {
    const strokeWidth = 2;

    // Half the notch depth = distance from an edge line to the notch centroid. Connector points
    // sit at the notch centre, so each is shifted by this off the edge (grooves in, tabs out).
    const vHalfDepth = (BrickOutlineGeneratorTest.V_NOTCH_RADIUS + (3 * strokeWidth) / 2) / 2;
    const hHalfDepth = (BrickOutlineGeneratorTest.H_NOTCH_RADIUS + (3 * strokeWidth) / 2) / 2;

    it('presence follows feature flags', () => {
        // A plain value brick: no notches, no args, no nesting.
        const value = brickOutlineGenerator.getConnectorCoords({
            strokeWidth,
            widgetDims: { w: 100, h: 20 },
            paramArgDims: [],
        });

        expect(value.inputs).toEqual([]);
        expect(value.prev).toBeUndefined();
        expect(value.next).toBeUndefined();
        expect(value.nestedNext).toBeUndefined();
        expect(value.output).toBeUndefined();

        // A fully-featured brick: every optional connector enabled plus one filled arg slot.
        const full = brickOutlineGenerator.getConnectorCoords({
            strokeWidth,
            widgetDims: { w: 100, h: 20 },
            paramArgDims: [{ param: null, arg: { w: 50, h: 40 } }],
            nestingDims: { w: 50, h: 40 },
            hasPrevNotch: true,
            hasNextNotch: true,
            hasOutputNotch: true,
        });

        expect(full.prev).toBeDefined();
        expect(full.next).toBeDefined();
        expect(full.nestedNext).toBeDefined();
        expect(full.output).toBeDefined();
        expect(full.inputs).toHaveLength(1);
    });

    it('inputs has one entry per filled arg slot, ordered top-to-bottom', () => {
        const paramArgDims = [
            { param: null, arg: { w: 50, h: 40 } },
            { param: { w: 50, h: 20 }, arg: null },
            { param: null, arg: { w: 50, h: 40 } },
        ];
        const { inputs } = brickOutlineGenerator.getConnectorCoords({
            strokeWidth,
            widgetDims: { w: 100, h: 20 },
            paramArgDims,
        });

        // Derive the expected count from the input itself — param-only rows contribute nothing.
        const expected = paramArgDims.filter((r) => r.arg !== null).length;
        expect(inputs).toHaveLength(expected);
        expect(expected).toBe(2);

        // Ordered top-to-bottom: y values strictly increasing.
        expect(inputs[1]!.y).toBeGreaterThan(inputs[0]!.y);
    });

    it('inputs align with the rendered arg grooves from generate()', () => {
        const input = {
            strokeWidth,
            widgetDims: { w: 100, h: 20 },
            paramArgDims: [
                { param: null, arg: { w: 50, h: 70 } },
                { param: null, arg: { w: 50, h: 40 } },
            ],
        };
        const { inputs } = brickOutlineGenerator.getConnectorCoords(input);
        const { bounds, width } = brickOutlineGenerator.generate(input);
        const argGrooves = bounds.args!.filter((a): a is NonNullable<typeof a> => a !== null);

        inputs.forEach((p, k) => {
            const a = argGrooves[k]!;
            expect(p.y).toBe(a.y + BrickOutlineGeneratorTest.H_NOTCH_OFFSET_Y);
            expect(p.x).toBe(a.x - strokeWidth / 2 - hHalfDepth);
        });
        // Grooves sit at the right edge (x = width); the connector is inset by half the stroke plus
        // half the notch depth, since the point sits at the groove centroid.
        expect(inputs[0]!.x).toBe(width - strokeWidth / 2 - hHalfDepth);
    });

    it("next connector sits on the brick's bottom edge (height branch)", () => {
        const nest = {
            strokeWidth,
            widgetDims: { w: 100, h: 20 },
            paramArgDims: [],
            nestingDims: { w: 50, h: 60 },
            hasNextNotch: true,
        };
        const dims = brickOutlineGenerator.computeDimensions(nest);
        const c = brickOutlineGenerator.getConnectorCoords(nest);

        expect(c.next!.y).toBe(dims.height - strokeWidth / 2 + vHalfDepth);
        // Proves the (hasNesting ? height : headHeight) branch selected the full height,
        // placing next on the tail-step bottom rather than the cavity roof.
        expect(c.next!.y).toBeGreaterThan(dims.headHeight);

        const flat = { ...nest, nestingDims: undefined };
        const fd = brickOutlineGenerator.computeDimensions(flat);
        expect(brickOutlineGenerator.getConnectorCoords(flat).next!.y).toBe(
            fd.height - strokeWidth / 2 + vHalfDepth,
        );
    });

    it('prev and next are vertically aligned for stacking', () => {
        const c = brickOutlineGenerator.getConnectorCoords({
            strokeWidth,
            widgetDims: { w: 100, h: 20 },
            paramArgDims: [],
            hasPrevNotch: true,
            hasNextNotch: true,
        });

        // prev is a top-edge groove; its centroid sits half the notch depth below the edge.
        expect(c.prev!.y).toBe(strokeWidth / 2 + vHalfDepth);
        // A brick's next tab must share its x with the prev groove of the brick stacked below.
        expect(c.prev!.x).toBe(c.next!.x);
    });

    it("nestedNext mates with a nested child's prev over the cavity", () => {
        const parent = {
            strokeWidth,
            widgetDims: { w: 100, h: 20 },
            paramArgDims: [],
            nestingDims: { w: 60, h: 60 },
        };
        const nestingX = brickOutlineGenerator.generate(parent).bounds.nesting!.x;
        const nestedNext = brickOutlineGenerator.getConnectorCoords(parent).nestedNext!;

        const childPrevX = brickOutlineGenerator.getConnectorCoords({
            strokeWidth,
            widgetDims: { w: 40, h: 20 },
            paramArgDims: [],
            hasPrevNotch: true,
        }).prev!.x;

        // A child dropped at the nesting origin lands its prev groove under the parent's roof tab.
        expect(nestedNext.x).toBe(nestingX + childPrevX);
    });

    it('output mates with a parent input inside its arg slot', () => {
        const parent = {
            strokeWidth,
            widgetDims: { w: 100, h: 20 },
            paramArgDims: [{ param: null, arg: { w: 50, h: 40 } }],
        };
        const parentInput = brickOutlineGenerator.getConnectorCoords(parent).inputs[0]!;
        const parentArg = brickOutlineGenerator.generate(parent).bounds.args![0]!;

        const output = brickOutlineGenerator.getConnectorCoords({
            strokeWidth,
            widgetDims: { w: 40, h: 20 },
            paramArgDims: [],
            hasOutputNotch: true,
        }).output!;

        // output is a left-edge tab; its centroid sits half the notch depth outside the edge.
        expect(output.x).toBe(strokeWidth / 2 - hHalfDepth);
        // The child's output seats into the parent's arg groove at the same in-slot offset.
        expect(output.y).toBe(parentInput.y - parentArg.y);
    });

    it('connector bounds carry the notch footprint (w/h)', () => {
        const vWidth = BrickOutlineGeneratorTest.V_NOTCH_WIDTH;
        const vDepth = BrickOutlineGeneratorTest.V_NOTCH_RADIUS + (3 * strokeWidth) / 2;
        const hWidth = BrickOutlineGeneratorTest.H_NOTCH_WIDTH;
        const hDepth = BrickOutlineGeneratorTest.H_NOTCH_RADIUS + (3 * strokeWidth) / 2;

        const c = brickOutlineGenerator.getConnectorCoords({
            strokeWidth,
            widgetDims: { w: 120, h: 20 },
            paramArgDims: [{ param: null, arg: { w: 50, h: 40 } }],
            nestingDims: { w: 60, h: 60 },
            hasPrevNotch: true,
            hasNextNotch: true,
            hasOutputNotch: true,
        });

        // V-notches (prev/next/nestedNext) span the notch width along the edge and the notch depth
        // across it; H-notches (output/inputs, left/right edges) are the transpose.
        for (const v of [c.prev!, c.next!, c.nestedNext!]) {
            expect(v.w).toBe(vWidth);
            expect(v.h).toBe(vDepth);
        }
        for (const h of [c.output!, c.inputs[0]!]) {
            expect(h.w).toBe(hDepth);
            expect(h.h).toBe(hWidth);
        }
    });

    it('every connector lies within a half-notch-depth margin of the brick frame', () => {
        const input = {
            strokeWidth,
            widgetDims: { w: 120, h: 20 },
            paramArgDims: [{ param: null, arg: { w: 50, h: 40 } }],
            nestingDims: { w: 60, h: 60 },
            hasPrevNotch: true,
            hasNextNotch: true,
            hasOutputNotch: true,
        };
        const { width, height } = brickOutlineGenerator.generate(input);
        const c = brickOutlineGenerator.getConnectorCoords(input);

        // Male-tab centroids (next below the bottom edge, output left of the left edge) sit at the
        // notch centre and therefore fall a half-depth OUTSIDE the frame; female-groove centroids
        // fall a half-depth inside. Allow a margin of at most one half-depth beyond each edge.
        const margin = Math.max(vHalfDepth, hHalfDepth);
        const pts = [c.prev!, c.next!, c.nestedNext!, c.output!, ...c.inputs];

        pts.forEach((p) => {
            expect(p.x).toBeGreaterThanOrEqual(-margin);
            expect(p.x).toBeLessThanOrEqual(width + margin);
            expect(p.y).toBeGreaterThanOrEqual(-margin);
            expect(p.y).toBeLessThanOrEqual(height + margin);
        });

        // The margin is meaningful: at least one tab centroid genuinely lands outside the frame.
        expect(c.next!.y).toBeGreaterThan(height);
        expect(c.output!.x).toBeLessThan(0);
    });

    it('interleaving with generate() does not corrupt the shared cache', () => {
        const gen = new BrickOutlineGeneratorTest(MINIMUMS);
        const A = { strokeWidth, widgetDims: { w: 200, h: 20 }, paramArgDims: [] };
        const B = {
            strokeWidth,
            widgetDims: { w: 60, h: 20 },
            paramArgDims: [{ param: null, arg: { w: 50, h: 40 } }],
        };

        const wA1 = gen.generate(A).width;
        const cB = gen.getConnectorCoords(B);
        const wA2 = gen.generate(A).width;

        // A getConnectorCoords(B) between two generate(A) calls must not leak state either way.
        const fresh = new BrickOutlineGeneratorTest(MINIMUMS).getConnectorCoords(B);
        expect(cB).toEqual(fresh);
        expect(wA2).toBe(wA1);
    });
});
