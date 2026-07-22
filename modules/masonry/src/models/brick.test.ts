import { StatementBrickModel } from '@/models/brick';
import { statementTreeNoNesting } from '@/mocks/tower';
import { SCALE_LEVEL_CONFIG } from '@/utils/constants';

// Generator geometry constants that the connector centroids are derived from (unscaled SVG units).
// Mirrored from BrickOutlineGenerator so the expected canvas-px values can be computed independently.
const V_NOTCH_OFFSET_X = 18;
const V_NOTCH_RADIUS = 2;
const H_NOTCH_OFFSET_Y = 16;
const TAIL_INDENT_W = 8;
const STROKE_WIDTH_PX = 2;

const colorsDefault = { background: '#3498db', foreground: '#ffffff', border: '#2980b9' };

function makeStatement(config: {
    scaleLevel: 1 | 2 | 3;
    hasConnectionPrev?: boolean;
    hasConnectionNext?: boolean;
    hasNesting?: boolean;
}): StatementBrickModel {
    return new StatementBrickModel({
        colorsDefault,
        tooltipText: '',
        widget: { type: 'label', text: 'St' },
        scaleLevel: config.scaleLevel,
        hasConnectionPrev: config.hasConnectionPrev,
        hasConnectionNext: config.hasConnectionNext,
        hasNesting: config.hasNesting,
    });
}

describe('BrickModelBase.getConnectorCoords', () => {
    it('returns connector centroids in canvas px, scaled by brickScale', () => {
        const scaleLevel = 3 as const;
        const brickScale = SCALE_LEVEL_CONFIG[scaleLevel].brickScale; // 1.25
        const brick = makeStatement({
            scaleLevel,
            hasConnectionPrev: true,
            hasConnectionNext: true,
            hasNesting: true,
        });

        const coords = brick.getConnectorCoords();

        // prev is a top-edge groove: x = V_NOTCH_OFFSET_X (svg) * brickScale. Its centroid sits half
        // the notch depth below the edge, so scaled y = STROKE_WIDTH_PX/2 (edge) + half the scaled
        // notch depth. The strokeWidth part of the depth scales back to px; the radius part scales.
        const vNotchDepthPx = V_NOTCH_RADIUS * brickScale + 1.5 * STROKE_WIDTH_PX;
        expect(coords.prev).toBeDefined();
        expect(coords.prev!.x).toBeCloseTo(V_NOTCH_OFFSET_X * brickScale); // 22.5
        expect(coords.prev!.y).toBeCloseTo(STROKE_WIDTH_PX / 2 + vNotchDepthPx / 2); // 3.75

        // next shares prev's x (vertical stacking alignment) and lives on the bottom edge.
        expect(coords.next).toBeDefined();
        expect(coords.next!.x).toBeCloseTo(V_NOTCH_OFFSET_X * brickScale); // 22.5
        expect(coords.next!.y).toBeGreaterThan(coords.prev!.y);

        // nestedNext x = (TAIL_INDENT_W + strokeWidth_svg + V_NOTCH_OFFSET_X) * brickScale
        //             = (TAIL_INDENT_W + V_NOTCH_OFFSET_X) * brickScale + STROKE_WIDTH_PX.
        expect(coords.nestedNext).toBeDefined();
        expect(coords.nestedNext!.x).toBeCloseTo(
            (TAIL_INDENT_W + V_NOTCH_OFFSET_X) * brickScale + STROKE_WIDTH_PX,
        ); // 34.5

        expect(coords.inputs).toEqual([]);
    });

    it('scales every connector coordinate up with the brick scale level', () => {
        const small = makeStatement({ scaleLevel: 2, hasConnectionPrev: true, hasNesting: true });
        const large = makeStatement({ scaleLevel: 3, hasConnectionPrev: true, hasNesting: true });

        const ratio = SCALE_LEVEL_CONFIG[3].brickScale / SCALE_LEVEL_CONFIG[2].brickScale; // 1.25

        // prev.x is a pure V_NOTCH_OFFSET_X * brickScale term, so its ratio is exactly brickScale's.
        expect(large.getConnectorCoords().prev!.x / small.getConnectorCoords().prev!.x).toBeCloseTo(
            ratio,
        );
    });

    it('omits connectors whose feature flags are off', () => {
        const brick = makeStatement({
            scaleLevel: 2,
            hasConnectionPrev: false,
            hasConnectionNext: false,
            hasNesting: false,
        });

        const coords = brick.getConnectorCoords();

        expect(coords.prev).toBeUndefined();
        expect(coords.next).toBeUndefined();
        expect(coords.nestedNext).toBeUndefined();
        expect(coords.output).toBeUndefined();
        expect(coords.inputs).toEqual([]);
    });

    it('places an input centroid per filled argument slot', () => {
        const brick = new StatementBrickModel({
            colorsDefault,
            tooltipText: '',
            widget: { type: 'label', text: 'St' },
            scaleLevel: 2,
            params: ['A'],
            argDims: [{ w: 50, h: 40 }],
        });

        const coords = brick.getConnectorCoords();

        // Single filled slot: first-row groove y = H_NOTCH_OFFSET_Y (svg) * brickScale (=1 here).
        expect(coords.inputs).toHaveLength(1);
        expect(coords.inputs[0]!.index).toBe(0);
        expect(coords.inputs[0]!.filled).toBe(true);
        expect(coords.inputs[0]!.bounds.y).toBeCloseTo(
            H_NOTCH_OFFSET_Y * SCALE_LEVEL_CONFIG[2].brickScale,
        );
    });

    it('emits an empty input slot for a param with no argument', () => {
        const brick = new StatementBrickModel({
            colorsDefault,
            tooltipText: '',
            widget: { type: 'label', text: 'St' },
            scaleLevel: 2,
            params: ['A'],
            argDims: [null],
        });

        const coords = brick.getConnectorCoords();

        // The slot is declared but holds no child: still emitted, tagged empty at index 0.
        expect(coords.inputs).toHaveLength(1);
        expect(coords.inputs[0]!.index).toBe(0);
        expect(coords.inputs[0]!.filled).toBe(false);
        expect(coords.inputs[0]!.bounds.y).toBeCloseTo(
            H_NOTCH_OFFSET_Y * SCALE_LEVEL_CONFIG[2].brickScale,
        );
    });

    it('works on a mock tower statement brick (default scale level)', () => {
        // St1 is the chain root: no prev connection, but chains into St2 via next, no args, no nesting.
        const root = statementTreeNoNesting;
        const coords = root.model.getConnectorCoords();

        expect(root.model.hasConnectionPrev).toBe(false);
        expect(coords.prev).toBeUndefined();
        expect(coords.next).toBeDefined();
        expect(coords.next!.x).toBeCloseTo(
            V_NOTCH_OFFSET_X * SCALE_LEVEL_CONFIG[root.model.scaleLevel].brickScale,
        );
        expect(coords.inputs).toEqual([]);
    });
});
