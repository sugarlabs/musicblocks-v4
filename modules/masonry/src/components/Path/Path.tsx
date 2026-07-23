import type { BrickOutlineInput } from '@/@types/brick.types';
import type { Bounds } from '@/@types/common.types';

import { BrickOutlineGenerator } from '@/utils/brick-shape';
import { SCALE_LEVEL_CONFIG } from '@/utils/constants';

const SCALE_LEVEL: keyof typeof SCALE_LEVEL_CONFIG = 2;
const SCALE = SCALE_LEVEL_CONFIG[SCALE_LEVEL].brickScale;

const pxToSvg = (px: number) => px / SCALE;
const svgToPx = (u: number) => u * SCALE;

const brickOutlineGenerator = new BrickOutlineGenerator({
  minWidth: pxToSvg(SCALE_LEVEL_CONFIG[SCALE_LEVEL].minWidth),
  minWidgetHeight: pxToSvg(SCALE_LEVEL_CONFIG[SCALE_LEVEL].minWidgetParamHeight),
  minParamHeight: pxToSvg(SCALE_LEVEL_CONFIG[SCALE_LEVEL].minWidgetParamHeight),
  minArgHeight: pxToSvg(SCALE_LEVEL_CONFIG[SCALE_LEVEL].minArgNestHeight),
  minNestHeight: pxToSvg(SCALE_LEVEL_CONFIG[SCALE_LEVEL].minArgNestHeight),
});

/**
 * Connector marker colours, keyed by connector type. Kept visually distinct from the
 * translucent bounds overlays (pink widget, yellow params, green args, grey nesting):
 *   prev       — magenta   next   — blue     nestedNext — teal
 *   output     — orange    inputs — purple
 * Each marker also gets a thin white outline so it stays legible over any overlay rect.
 */
const CONNECTOR_COLORS = {
  prev: '#e84393',
  next: '#0984e3',
  nestedNext: '#00cec9',
  output: '#e17055',
  inputs: '#6c5ce7',
};



/**
 * Storybook-only debug harness. Renders the raw SVG path from `BrickOutlineGenerator`
 * with coloured overlays for the widget, param, arg, and nesting bounds regions.
 */
export function PathBrickView({ input }: { input: BrickOutlineInput }) {
  const maxArgW = Math.max(0, ...input.paramArgDims.map((p) => p.arg?.w ?? 0));
  const svgInput: BrickOutlineInput = {
    strokeWidth: pxToSvg(input.strokeWidth),
    widgetDims: { w: pxToSvg(input.widgetDims.w), h: pxToSvg(input.widgetDims.h) },
    paramArgDims: input.paramArgDims.map((p) => ({
      param: p.param ? { w: pxToSvg(p.param.w), h: pxToSvg(p.param.h) } : null,
      arg: p.arg
        ? { w: pxToSvg(p.arg.w), h: pxToSvg(p.arg.h) }
        : p.param
          ? { w: 0, h: pxToSvg(SCALE_LEVEL_CONFIG[SCALE_LEVEL].minArgNestHeight) }
          : null,
    })),
    nestingDims:
      input.nestingDims !== undefined
        ? input.nestingDims !== null
          ? { w: pxToSvg(input.nestingDims.w), h: pxToSvg(input.nestingDims.h) }
          : null
        : undefined,
    hasPrevNotch: input.hasPrevNotch,
    hasNextNotch: input.hasNextNotch,
    hasOutputNotch: input.hasOutputNotch,
  };
  const { width, height, path, bounds } = brickOutlineGenerator.generate(svgInput);
  const connectors = brickOutlineGenerator.getConnectorCoords(svgInput);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={svgToPx(width) + maxArgW}
      height={svgToPx(height)}
      className="overflow-visible"
    >
      {/* Debug underlay: brick bounding box */}
      <rect x={0} y={0} width={svgToPx(width)} height={svgToPx(height)} fill="#efe4e4" />

      <path
        d={path}
        transform={`scale(${SCALE})`}
        fill="#70a1ff"
        stroke="#3867d6"
        strokeWidth={pxToSvg(input.strokeWidth)}
      />

      {/* Debug overlay: visualises the markers */}
      <>
        {/* Primary widget */}
        <rect
          x={svgToPx(bounds.widget.x)}
          y={svgToPx(bounds.widget.y)}
          width={svgToPx(bounds.widget.w)}
          height={svgToPx(bounds.widget.h)}
          fill="#ffcccc"
        />

        {/* Per-parameter label areas (optional) — one rect per param name slot */}
        {bounds.params?.map((b, i) =>
          b ? (
            <rect
              key={i}
              x={svgToPx(b.x)}
              y={svgToPx(b.y)}
              width={svgToPx(b.w)}
              height={svgToPx(b.h)}
              fill="#ffda79"
            />
          ) : null,
        )}

        {/* Per-argument slot areas */}
        {bounds.args?.map((b, i) =>
          b ? (
            <rect
              key={i}
              x={svgToPx(b.x)}
              y={svgToPx(b.y)}
              width={svgToPx(b.w)}
              height={svgToPx(b.h)}
              fill={i % 2 === 0 ? '#26de819f' : '#20bf6b9f'}
            />
          ) : null,
        )}

        {/* Nesting (clamp) area — present only on bricks that wrap inner blocks */}
        {bounds.nesting && (
          <rect
            x={svgToPx(bounds.nesting.x)}
            y={svgToPx(bounds.nesting.y)}
            width={svgToPx(bounds.nesting.w)}
            height={svgToPx(bounds.nesting.h)}
            fill="#a5b1c27f"
          />
        )}

        {/* Connector footprints — colour-coded by type (see CONNECTOR_COLORS). Each connector's
            `bounds` carries a footprint (width and height), rendered as translucent rectangles. */}
        {(
          [
            connectors.prev && { kind: 'prev', bounds: connectors.prev },
            connectors.next && { kind: 'next', bounds: connectors.next },
            connectors.nestedNext && { kind: 'nestedNext', bounds: connectors.nestedNext },
            connectors.output && { kind: 'output', bounds: connectors.output },
            ...connectors.inputs.map((bounds) => ({ kind: 'inputs' as const, bounds })),
          ].filter(Boolean) as { kind: keyof typeof CONNECTOR_COLORS; bounds: Bounds }[]
        ).map(({ kind, bounds }, i) => (
          <rect
            key={`${kind}-${i}`}
            x={svgToPx(bounds.x - bounds.w / 2)}
            y={svgToPx(bounds.y - bounds.h / 2)}
            width={svgToPx(bounds.w)}
            height={svgToPx(bounds.h)}
            fill={CONNECTOR_COLORS[kind]}
            fillOpacity={0.4}
            stroke="#fff"
            strokeWidth={0.5}
          />
        ))}
      </>
    </svg>
  );
}
