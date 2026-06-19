import type { Bounds, BrickViewFixedProps, Size } from '@masonry/@types/brick';

import { SCALE_LEVEL_CONFIG } from '../../utils/constants';
import { createBrickOutlineGenerator } from '../../utils/path2';
import { measureTextWidth } from '../../utils/textMeasurement';

const STROKE_WIDTH = 2;
const DEFAULT_SCALE_LEVEL: keyof typeof SCALE_LEVEL_CONFIG = 2;
/** Horizontal breathing room added around measured label/param text (px). */
const TEXT_PAD = 8;

/** Display-only sub-component of `BrickView`: renders the outline + label for value/expression/statement bricks, with placeholder regions for params, arg slots, and nesting. */
export function BrickViewFixed(props: BrickViewFixedProps) {
  const scaleConfig = SCALE_LEVEL_CONFIG[props.scaleLevel ?? DEFAULT_SCALE_LEVEL];
  const { brickScale, fontSize, lineHeight } = scaleConfig;

  // Two coordinate spaces: props/DOM are in px; path2 works in SVG units scaled up by brickScale.
  const pxToSvg = (px: number) => px / brickScale;
  const svgToPx = (units: number) => units * brickScale;

  // Only the `label` display widget renders text for now (graphic/variant skipped).
  const labelText = props.widget.type === 'label' ? props.widget.text : '';
  const labelDims: Size = {
    w: labelText ? measureTextWidth(labelText, fontSize) + TEXT_PAD : 0,
    h: lineHeight,
  };

  const measureParam = (param?: string): Size | null =>
    param ? { w: measureTextWidth(param, fontSize) + TEXT_PAD, h: lineHeight } : null;

  // Per-kind: param/arg slots, nesting, and which notches to draw.
  const paramArgs = props.kind === 'value' ? [] : (props.paramArgs ?? []);
  const paramArgDims = paramArgs.map((paramArg) => ({
    param: measureParam(paramArg.param),
    arg: paramArg.argDims,
  }));
  // Param labels in order, aligned with the (non-null) param bounds the generator emits.
  const paramTexts = paramArgs
    .map((paramArg) => paramArg.param)
    .filter((param): param is string => Boolean(param));

  // Arguments (value/expression) plug into a parent via the left notch.
  const hasLeftNotch = props.kind === 'value' || props.kind === 'expression';
  // Statements connect into a vertical sequence via the top/bottom notches.
  const hasTopNotch = props.kind === 'statement' && (props.hasConnectionPrev ?? false);
  const hasBottomNotch = props.kind === 'statement' && (props.hasConnectionNext ?? false);

  // Nesting cavity (statement only). A folded brick collapses the cavity, so it is omitted.
  const showNesting =
    props.kind === 'statement' && props.nesting !== undefined && !props.nesting.isFolded;
  const nestingDims: Size | null | undefined =
    props.kind === 'statement' && showNesting ? props.nesting!.dims : undefined;

  const { width, height, path, bounds } = createBrickOutlineGenerator({
    minWidth: pxToSvg(scaleConfig.minWidth),
    minLabelHeight: pxToSvg(scaleConfig.minLabelParamHeight),
    minNestHeight: pxToSvg(scaleConfig.minArgNestHeight),
    minParamHeight: pxToSvg(scaleConfig.minLabelParamHeight),
    minArgHeight: pxToSvg(scaleConfig.minArgNestHeight),
  })({
    strokeWidth: pxToSvg(STROKE_WIDTH),
    labelDims: { w: pxToSvg(labelDims.w), h: pxToSvg(labelDims.h) },
    paramArgDims: paramArgDims.map((paramArg) => ({
      param: paramArg.param ? { w: pxToSvg(paramArg.param.w), h: pxToSvg(paramArg.param.h) } : null,
      arg: paramArg.arg ? { w: pxToSvg(paramArg.arg.w), h: pxToSvg(paramArg.arg.h) } : null,
    })),
    nestingDims:
      nestingDims === undefined
        ? undefined
        : nestingDims === null
          ? null
          : { w: pxToSvg(nestingDims.w), h: pxToSvg(nestingDims.h) },
    hasTopNotch,
    hasBottomNotch,
    hasLeftNotch,
  });

  const { background, foreground, border } = props.colorsDefault;

  const toPxBounds = (bound: Bounds): Bounds => ({
    x: svgToPx(bound.x),
    y: svgToPx(bound.y),
    w: svgToPx(bound.w),
    h: svgToPx(bound.h),
  });

  const labelBounds = toPxBounds(bounds.label);
  const paramBounds = (bounds.params ?? []).map(toPxBounds);

  const textStyle = {
    margin: 0,
    fontSize,
    lineHeight: `${lineHeight}px`,
    whiteSpace: 'nowrap' as const,
    color: foreground,
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={svgToPx(width)}
      height={svgToPx(height)}
      style={{ overflow: 'visible' }}
    >
      <path
        d={path}
        transform={`scale(${brickScale})`}
        fill={background}
        stroke={border}
        strokeWidth={pxToSvg(STROKE_WIDTH)}
      />

      {/* Main label */}
      {labelText && (
        <foreignObject
          x={labelBounds.x}
          y={labelBounds.y}
          width={labelBounds.w}
          height={labelBounds.h}
        >
          <div
            style={{
              width: labelBounds.w,
              height: labelBounds.h,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <p style={textStyle}>{labelText}</p>
          </div>
        </foreignObject>
      )}

      {/* Parameter labels */}
      {paramBounds.map((bound, i) => (
        <foreignObject key={`param-${i}`} x={bound.x} y={bound.y} width={bound.w} height={bound.h}>
          <div style={{ width: bound.w, height: bound.h, display: 'flex', alignItems: 'center' }}>
            <p style={textStyle}>{paramTexts[i] ?? ''}</p>
          </div>
        </foreignObject>
      ))}
    </svg>
  );
}
