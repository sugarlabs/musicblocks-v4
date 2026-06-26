import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type {
  Bounds,
  ExpressionBrickViewProps,
  Size,
  StatementBrickViewProps,
  ValueBrickViewProps,
  ParamArgPair,
} from '../../../@types/brick';

import { SCALE_LEVEL_CONFIG } from '../../utils/constants';
import { BrickOutlineGenerator } from '../../utils/path2';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';

export type BrickViewFixedProps =
  | (Omit<ValueBrickViewProps, 'widget'> & { widget: ExpressionBrickViewProps['widget'] })
  | ExpressionBrickViewProps
  | StatementBrickViewProps;

const STROKE_WIDTH = 2;
const DEFAULT_SCALE_LEVEL: keyof typeof SCALE_LEVEL_CONFIG = 2;
// Param labels render smaller than the main label so the brick's identity
// (the label) stays dominant while params read as secondary detail.
const PARAM_FONT_SCALE = 0.8;

export function BrickViewFixed(props: BrickViewFixedProps) {
  const { brickScale, minWidth, minArgNestHeight, minWidgetParamHeight, fontSize, lineHeight } =
    SCALE_LEVEL_CONFIG[props.scaleLevel ?? DEFAULT_SCALE_LEVEL];

  // Param labels share the main label's color but render at a smaller size.
  const paramFontSize = Math.round(fontSize * PARAM_FONT_SCALE);
  const paramLineHeight = Math.round(lineHeight * PARAM_FONT_SCALE);

  const pxToSvg = useCallback((px: number) => px / brickScale, [brickScale]);
  const svgToPx = useCallback((u: number) => u * brickScale, [brickScale]);

  const [path, setPath] = useState('');
  const [dims, setDims] = useState<Size>({ w: 0, h: 0 });

  const [labelDims, setLabelDims] = useState<Size>({ w: 0, h: 0 });
  const [labelBounds, setLabelBounds] = useState<Bounds>({ x: 0, y: 0, w: 0, h: 0 });

  // For parameter labels
  const paramArgs = 'paramArgs' in props ? (props.paramArgs ?? []) : [];
  const [paramDimsList, setParamDimsList] = useState<Size[]>(paramArgs.map(() => ({ w: 0, h: 0 })));
  const [paramBoundsList, setParamBoundsList] = useState<(Bounds | null)[]>([]);

  const labelRef = useRef<HTMLDivElement>(null);
  const paramRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const isLabelWidget = props.widget.type === 'label';
  const isVariantWidget = props.widget.type === 'variant';

  const labelText = props.widget.type === 'label' ? props.widget.text : '';
  const labelGlyph = props.widget.type === 'label' ? props.widget.glyph : undefined;

  const variantOptions = props.widget.type === 'variant' ? props.widget.options : [];
  const variantValue = props.widget.type === 'variant' ? props.widget.value : '';

  const widgetContent =
    props.widget.type === 'label'
      ? props.widget.text
      : props.widget.type === 'variant'
        ? props.widget.value
        : '';

  const generateOutline = useMemo(
    () =>
      new BrickOutlineGenerator({
        minWidth: pxToSvg(minWidth),
        minWidgetHeight: pxToSvg(minWidgetParamHeight),
        minParamHeight: pxToSvg(minWidgetParamHeight),
        minArgHeight: pxToSvg(minArgNestHeight),
        minNestHeight: pxToSvg(minArgNestHeight),
      }),
    [minWidth, minWidgetParamHeight, minArgNestHeight, pxToSvg],
  );

  const paramArgsString = JSON.stringify(paramArgs);

  // Layout Effect 1: Measures the actual rendered DOM text dimensions.
  // Dependencies include fontSize and lineHeight so that scaleLevel changes correctly recalculate width/height.
  useLayoutEffect(() => {
    // Measure main label
    if (labelRef.current) {
      const { width, height } = labelRef.current.getBoundingClientRect();
      setLabelDims((prev) => (width !== prev.w || height !== prev.h ? { w: width, h: height } : prev));
    }

    // Measure param labels
    setParamDimsList((prev) => {
      let changed = false;
      const newParamDimsList = [...prev];
      paramRefs.current.forEach((el, i) => {
        if (el) {
          const { width, height } = el.getBoundingClientRect();
          if (width !== newParamDimsList[i]?.w || height !== newParamDimsList[i]?.h) {
            newParamDimsList[i] = { w: width, h: height };
            changed = true;
          }
        }
      });
      return changed ? newParamDimsList : prev;
    });
  }, [widgetContent, paramArgsString, fontSize, lineHeight]);

  const hasConnectionPrev = 'hasConnectionPrev' in props ? props.hasConnectionPrev : false;
  const hasConnectionNext = 'hasConnectionNext' in props ? props.hasConnectionNext : false;
  const nesting = 'nesting' in props ? props.nesting : undefined;

  useLayoutEffect(() => {
    let nestingDims;
    let hasPrevNotch = false;
    let hasNextNotch = false;

    let hasOutputNotch = props.kind === 'value' || props.kind === 'expression';

    if (props.kind === 'statement') {
      hasPrevNotch = hasConnectionPrev ?? false;
      hasNextNotch = hasConnectionNext ?? false;
      if (nesting) {
        // If the nesting cavity is folded, we pass undefined to path2.ts
        // so it omits the cavity entirely and draws a flush, solid block.
        nestingDims = nesting.isFolded ? undefined : (nesting.dims ?? null);
      }
    }

    const {
      width,
      height,
      path: generatedPath,
      bounds,
    } = generateOutline.generate({
      strokeWidth: pxToSvg(STROKE_WIDTH),
      widgetDims: { w: pxToSvg(labelDims.w), h: pxToSvg(labelDims.h) },
      paramArgDims: paramArgs.map((pa, i) => ({
        param: pa.param
          ? { w: pxToSvg(paramDimsList[i]?.w ?? 0), h: pxToSvg(paramDimsList[i]?.h ?? 0) }
          : null,
        arg: pa.argDims
          ? { w: pxToSvg(pa.argDims.w), h: pxToSvg(pa.argDims.h) }
          : pa.param
            ? { w: 0, h: pxToSvg(minArgNestHeight) }
            : null,
      })),
      nestingDims:
        nestingDims !== undefined
          ? nestingDims === null
            ? null
            : { w: pxToSvg(nestingDims.w), h: pxToSvg(nestingDims.h) }
          : undefined,
      hasPrevNotch,
      hasNextNotch,
      hasOutputNotch,
    });

    setPath(generatedPath);
    setDims({ w: width, h: height });

    setLabelBounds({
      x: svgToPx(bounds.widget.x),
      y: svgToPx(bounds.widget.y),
      w: svgToPx(bounds.widget.w),
      h: svgToPx(bounds.widget.h),
    });

    if (bounds.params) {
      setParamBoundsList(
        bounds.params.map((b) =>
          b
            ? {
                x: svgToPx(b.x),
                y: svgToPx(b.y),
                w: svgToPx(b.w),
                h: svgToPx(b.h),
              }
            : null,
        ),
      );
    }
  }, [
    props.kind,
    hasConnectionPrev,
    hasConnectionNext,
    nesting,
    labelDims,
    paramDimsList,
    generateOutline,
    svgToPx,
    pxToSvg,
    paramArgsString,
    minArgNestHeight,
  ]);

  const maxArgW = Math.max(0, ...paramArgs.map((p) => p.argDims?.w ?? 0));

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={svgToPx(dims.w) + maxArgW}
      height={svgToPx(dims.h)}
      className="overflow-visible"
    >
      <path
        d={path}
        transform={`scale(${brickScale})`}
        fill={props.colorsDefault.background}
        stroke={props.colorsDefault.border}
        strokeWidth={pxToSvg(STROKE_WIDTH)}
      />

      {/* Main Widget */}
      {(isLabelWidget || isVariantWidget) && (
        <foreignObject
          x={labelBounds.x}
          y={labelBounds.y}
          width={labelBounds.w || 9999}
          height={labelBounds.h || 9999}
        >
          <div
            className="flex items-center"
            style={{
              width: labelBounds.w || undefined,
              height: labelBounds.h || undefined,
            }}
          >
            <div ref={labelRef} className="flex w-max items-center gap-1">
              {isLabelWidget && (
                <>
                  <p
                    className="m-0 max-w-none whitespace-nowrap"
                    style={{
                      fontSize,
                      lineHeight: `${lineHeight}px`,
                      color: props.colorsDefault.foreground,
                    }}
                  >
                    {labelText}
                  </p>
                  {labelGlyph?.src && (
                    <img
                      src={labelGlyph.src}
                      alt="glyph"
                      className="shrink-0 object-contain"
                      style={{ width: fontSize, height: fontSize }}
                    />
                  )}
                  {labelGlyph?.name && !labelGlyph.src && (
                    <span
                      className={`glyph-${labelGlyph.name} shrink-0`}
                      style={{ color: labelGlyph.color, fontSize }}
                    />
                  )}
                </>
              )}
              {isVariantWidget && (
                <Select value={variantValue} onValueChange={() => {}}>
                  <SelectTrigger
                    className="h-7 min-w-[4rem] gap-1 bg-transparent px-2 py-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    style={{
                      fontSize,
                      lineHeight: `${lineHeight}px`,
                      color: props.colorsDefault.foreground,
                      borderColor: props.colorsDefault.border,
                    }}
                  >
                    <div className="grid">
                      <span
                        className="pointer-events-none invisible col-start-1 row-start-1 w-max"
                        aria-hidden="true"
                      >
                        {variantOptions.reduce((a, b) => (a.length > b.length ? a : b), '')}
                      </span>
                      <span className="col-start-1 row-start-1 flex min-w-0 items-center justify-start">
                        <SelectValue />
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent
                    alignItemWithTrigger={false}
                    className="min-w-0"
                    style={{
                      backgroundColor: props.colorsDefault.background,
                      borderColor: props.colorsDefault.border,
                      color: props.colorsDefault.foreground,
                    }}
                  >
                    {variantOptions.map((opt) => (
                      <SelectItem
                        key={opt}
                        value={opt}
                        className="focus:bg-black/10 focus:text-inherit dark:focus:bg-white/10"
                      >
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </foreignObject>
      )}

      {props.widget.type === 'graphic' && (
        <image
          href={props.widget.src}
          x={labelBounds.x}
          y={labelBounds.y}
          width={labelBounds.w}
          height={labelBounds.h}
          preserveAspectRatio="xMidYMid meet"
        />
      )}

      {/* Parameters */}
      {paramArgs.map((pa, i) => {
        const paramText = pa.param;
        if (!paramText) return null;

        const bounds = paramBoundsList[i] || { x: 0, y: 0, w: 0, h: 0 };

        return (
          <foreignObject
            key={i}
            x={bounds.x}
            y={bounds.y}
            width={bounds.w || 9999}
            height={bounds.h || 9999}
          >
            <div
              className="flex items-center"
              style={{
                width: bounds.w || undefined,
                height: bounds.h || undefined,
              }}
            >
              <p
                ref={(el) => {
                  paramRefs.current[i] = el;
                }}
                className="m-0 max-w-none whitespace-nowrap"
                style={{
                  // Smaller than the main label so params read as secondary.
                  fontSize: paramFontSize,
                  lineHeight: `${paramLineHeight}px`,
                  // Same color as the main label, sitting next to the arg notch.
                  color: props.colorsDefault.foreground,
                }}
              >
                {paramText}
              </p>
            </div>
          </foreignObject>
        );
      })}
    </svg>
  );
}
