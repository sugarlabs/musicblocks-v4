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

// Ensure the widget is exclusively of type WidgetDisplay (no input widgets)
type WidgetDisplay =
  | { type: 'label'; text: string; glyph?: { name?: string; src?: string; color?: string } }
  | { type: 'graphic'; src: string }
  | { type: 'variant'; options: string[]; value: string };

// Utility to explicitly strip out tooltipText from inherited types
type OmitTooltip<T> = Omit<T, 'tooltipText'>;

export type BrickViewFixedProps =
  | (OmitTooltip<Omit<ValueBrickViewProps, 'widget'>> & { widget: WidgetDisplay })
  | OmitTooltip<ExpressionBrickViewProps>
  | OmitTooltip<StatementBrickViewProps>;

const STROKE_WIDTH = 2;
const DEFAULT_SCALE_LEVEL: keyof typeof SCALE_LEVEL_CONFIG = 2;
// Param labels render smaller than the main label so the brick's identity
// (the label) stays dominant while params read as secondary detail.
const PARAM_FONT_SCALE = 0.8;
// Use a stable reference for empty parameter arrays to prevent unnecessary re-renders.
const EMPTY_PARAM_ARGS: ParamArgPair[] = [];

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
  const paramArgs = 'paramArgs' in props ? (props.paramArgs ?? EMPTY_PARAM_ARGS) : EMPTY_PARAM_ARGS;
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

  const widgetDep =
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

  // Layout Effect 1: Measures the actual rendered DOM text dimensions.
  // Dependencies include fontSize and lineHeight so that scaleLevel changes correctly recalculate width/height.
  useLayoutEffect(() => {
    let changed = false;

    // Measure main label
    let newLabelDims = { w: 0, h: 0 };
    if (labelRef.current) {
      const { width, height } = labelRef.current.getBoundingClientRect();
      if (width !== labelDims.w || height !== labelDims.h) {
        newLabelDims = { w: width, h: height };
        changed = true;
      } else {
        newLabelDims = labelDims;
      }
    }

    // Measure param labels
    const newParamDimsList = [...paramDimsList];
    paramRefs.current.forEach((el, i) => {
      if (el) {
        const { width, height } = el.getBoundingClientRect();
        if (width !== newParamDimsList[i]?.w || height !== newParamDimsList[i]?.h) {
          newParamDimsList[i] = { w: width, h: height };
          changed = true;
        }
      }
    });

    if (changed) {
      setLabelDims(newLabelDims);
      setParamDimsList(newParamDimsList);
    }
  }, [widgetDep, paramArgs.length, labelDims, paramDimsList, fontSize, lineHeight]);

  const hasConnectionPrev = 'hasConnectionPrev' in props ? props.hasConnectionPrev : false;
  const hasConnectionNext = 'hasConnectionNext' in props ? props.hasConnectionNext : false;
  const nesting = 'nesting' in props ? props.nesting : undefined;
  const paramArgsString = JSON.stringify(paramArgs);

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
    paramArgs,
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
              width: labelBounds.w,
              height: labelBounds.h,
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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    alignItemWithTrigger={false}
                    sideOffset={Math.max(0, svgToPx(dims.h) - (labelBounds.y + labelBounds.h)) + 8}
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
      {paramBoundsList.map((bounds, i) => {
        const paramText = paramArgs[i]?.param;
        if (!paramText || !bounds) return null;

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
                width: bounds.w,
                height: bounds.h,
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
