import type { BrickOutlineInput } from '@/@types/brick';

import { SCALE_LEVEL_CONFIG } from '../../utils/constants';
import { createBrickOutlineGenerator } from '../../utils/path2';

const SCALE_LEVEL: keyof typeof SCALE_LEVEL_CONFIG = 3;
const SCALE = SCALE_LEVEL_CONFIG[SCALE_LEVEL].brickScale;

const pxToSvg = (px: number) => px / SCALE;
const svgToPx = (u: number) => u * SCALE;

const generateBrickOutline = createBrickOutlineGenerator({
  minWidth: pxToSvg(SCALE_LEVEL_CONFIG[SCALE_LEVEL].minWidth),
  minLabelHeight: pxToSvg(SCALE_LEVEL_CONFIG[SCALE_LEVEL].minLabelParamHeight),
  minNestHeight: pxToSvg(SCALE_LEVEL_CONFIG[SCALE_LEVEL].minArgNestHeight),
  minParamHeight: pxToSvg(SCALE_LEVEL_CONFIG[SCALE_LEVEL].minLabelParamHeight),
  minArgHeight: pxToSvg(SCALE_LEVEL_CONFIG[SCALE_LEVEL].minArgNestHeight),
});

export function PathBrickView({ input }: { input: BrickOutlineInput }) {
  const maxArgW = Math.max(0, ...input.paramArgDims.map((p) => p.arg?.w ?? 0));
  const { width, height, path, bounds } = generateBrickOutline({
    strokeWidth: pxToSvg(input.strokeWidth),
    labelDims: { w: pxToSvg(input.labelDims.w), h: pxToSvg(input.labelDims.h) },
    paramArgDims: input.paramArgDims.map((p) => ({
      param: p.param ? { w: pxToSvg(p.param.w), h: pxToSvg(p.param.h) } : null,
      arg: p.arg ? { w: pxToSvg(p.arg.w), h: pxToSvg(p.arg.h) } : null,
    })),
    nestingDims:
      input.nestingDims !== undefined
        ? input.nestingDims !== null
          ? { w: pxToSvg(input.nestingDims.w), h: pxToSvg(input.nestingDims.h) }
          : null
        : undefined,
    hasTopNotch: input.hasTopNotch,
    hasBottomNotch: input.hasBottomNotch,
    hasLeftNotch: input.hasLeftNotch,
  });

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={svgToPx(width) + maxArgW}
      height={svgToPx(height)}
      style={{ overflow: 'visible' }}
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
        {/* Primary label */}
        <rect
          x={svgToPx(bounds.label.x)}
          y={svgToPx(bounds.label.y)}
          width={svgToPx(bounds.label.w)}
          height={svgToPx(bounds.label.h)}
          fill="#ffcccc"
        />

        {/* Per-parameter label areas (optional) — one rect per param name slot */}
        {bounds.params?.map((b, i) => (
          <rect
            key={i}
            x={svgToPx(b.x)}
            y={svgToPx(b.y)}
            width={svgToPx(b.w)}
            height={svgToPx(b.h)}
            fill="#ffda79"
          />
        ))}

        {/* Per-argument slot areas */}
        {bounds.args?.map((b, i) => (
          <rect
            key={i}
            x={svgToPx(b.x)}
            y={svgToPx(b.y)}
            width={svgToPx(b.w)}
            height={svgToPx(b.h)}
            fill={i % 2 === 0 ? '#26de819f' : '#20bf6b9f'}
          />
        ))}

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
      </>
    </svg>
  );
}
