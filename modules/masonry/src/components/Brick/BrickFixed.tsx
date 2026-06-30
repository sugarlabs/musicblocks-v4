import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type {
  Bounds,
  ExpressionBrickViewProps,
  ExpressionBrickViewPropsWithModel,
  Size,
  StatementBrickViewProps,
  StatementBrickViewPropsWithModel,
  ValueBrickViewProps,
  ValueBrickViewPropsWithModel,
} from '@/@types/brick.types';

import type { ExpressionBrickModel, StatementBrickModel } from '@/models/brick';

import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { BrickOutlineGenerator } from '@/utils/brick-shape';
import { SCALE_LEVEL_CONFIG } from '@/utils/constants';

export type BrickViewFixedProps =
  | (Omit<ValueBrickViewProps, 'widget'> & { widget: ExpressionBrickViewProps['widget'] })
  | ExpressionBrickViewProps
  | StatementBrickViewProps;

/**
 * Model-based prop type for BrickViewFixedWithModel.
 * Accepts a model instance instead of individual configuration props.
 * The existing BrickViewFixedProps type is preserved for backward compatibility.
 */
export type BrickViewFixedPropsWithModel =
  | ValueBrickViewPropsWithModel
  | ExpressionBrickViewPropsWithModel
  | StatementBrickViewPropsWithModel;

const STROKE_WIDTH = 2;
const DEFAULT_SCALE_LEVEL: keyof typeof SCALE_LEVEL_CONFIG = 2;
// Param labels render smaller than the main label so the brick's identity
// (the label) stays dominant while params read as secondary detail.
const PARAM_FONT_SCALE = 0.8;

/**
 * Renders a brick whose widget is fixed — no free user input. The variant widget is the sole
 * exception, using a select UI, but it remains semantically fixed: the brick represents a
 * predetermined concept, and the select only switches between its predefined forms.
 */
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

  const hasConnectionPrev = 'hasConnectionPrev' in props ? props.hasConnectionPrev : false;
  const hasConnectionNext = 'hasConnectionNext' in props ? props.hasConnectionNext : false;
  const nesting = 'nesting' in props ? props.nesting : undefined;

  // For parameter labels
  const paramArgs = 'paramArgs' in props ? (props.paramArgs ?? []) : [];
  const [paramDimsList, setParamDimsList] = useState<Size[]>(paramArgs.map(() => ({ w: 0, h: 0 })));
  const [paramBoundsList, setParamBoundsList] = useState<(Bounds | null)[]>([]);

  const labelRef = useRef<HTMLDivElement>(null);
  const paramRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const isLabelWidget = props.widget.type === 'label';
  const isVariantWidget = props.widget.type === 'variant';
  const isGraphicWidget = props.widget.type === 'graphic';

  const labelText = props.widget.type === 'label' ? props.widget.text : '';
  const labelGlyph = props.widget.type === 'label' ? props.widget.glyph : undefined;

  const variantOptions = props.widget.type === 'variant' ? props.widget.options : [];
  const variantValue = props.widget.type === 'variant' ? props.widget.value : '';

  const graphicSrc = props.widget.type === 'graphic' ? props.widget.src : undefined;

  const widgetContent =
    props.widget.type === 'label'
      ? props.widget.text
      : props.widget.type === 'variant'
        ? props.widget.value
        : props.widget.type === 'graphic'
          ? props.widget.src
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

  // Stringify paramArgs for a stable dep — prevents re-measuring on referentially new but equal arrays.
  const paramArgsString = JSON.stringify(paramArgs);

  const nestingIsFolded = nesting?.isFolded;
  const nestingDimsW = nesting?.dims?.w;
  const nestingDimsH = nesting?.dims?.h;
  const hasNesting = nesting !== undefined;

  const { hasPrevNotch, hasNextNotch, hasOutputNotch, nestingDims } = useMemo(() => {
    let computedNestingDims;
    let hasPrevNotch = false;
    let hasNextNotch = false;
    let hasOutputNotch = props.kind === 'value' || props.kind === 'expression';

    if (props.kind === 'statement') {
      hasPrevNotch = hasConnectionPrev ?? false;
      hasNextNotch = hasConnectionNext ?? false;
      if (hasNesting) {
        if (nestingIsFolded) {
          computedNestingDims = undefined;
        } else if (nestingDimsW !== undefined && nestingDimsH !== undefined) {
          computedNestingDims = { w: nestingDimsW, h: nestingDimsH };
        } else {
          computedNestingDims = null;
        }
      }
    }
    return { hasPrevNotch, hasNextNotch, hasOutputNotch, nestingDims: computedNestingDims };
  }, [
    props.kind,
    hasConnectionPrev,
    hasConnectionNext,
    hasNesting,
    nestingIsFolded,
    nestingDimsW,
    nestingDimsH,
  ]);

  // Layout Effect 1: Measures the actual rendered DOM text dimensions.
  // fontSize and lineHeight are deps so that scaleLevel changes correctly recalculate width/height.
  useLayoutEffect(() => {
    // Measure main label
    if (labelRef.current) {
      const { width, height } = labelRef.current.getBoundingClientRect();
      setLabelDims((prev) =>
        width !== prev.w || height !== prev.h ? { w: width, h: height } : prev,
      );
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

  // Layout Effect 2: Converts measured DOM dimensions to SVG units and generates the
  // brick outline path. argDims and nestingDims come from outside — this component only
  // allocates slot space, never renders those bricks.
  useLayoutEffect(() => {
    const scaledWidgetDims = { w: pxToSvg(labelDims.w), h: pxToSvg(labelDims.h) };

    const parsedParamArgs = JSON.parse(paramArgsString) as typeof paramArgs;
    const scaledParamArgDims = parsedParamArgs.map((pa, i) => ({
      param: pa.param
        ? { w: pxToSvg(paramDimsList[i]?.w ?? 0), h: pxToSvg(paramDimsList[i]?.h ?? 0) }
        : null,
      arg: pa.argDims
        ? { w: pxToSvg(pa.argDims.w), h: pxToSvg(pa.argDims.h) }
        : pa.param
          ? { w: 0, h: pxToSvg(minArgNestHeight) }
          : null,
    }));

    const scaledNestingDims =
      nestingDims !== undefined
        ? nestingDims === null
          ? null
          : { w: pxToSvg(nestingDims.w), h: pxToSvg(nestingDims.h) }
        : undefined;

    const {
      width,
      height,
      path: generatedPath,
      bounds,
    } = generateOutline.generate({
      strokeWidth: pxToSvg(STROKE_WIDTH),
      widgetDims: scaledWidgetDims,
      paramArgDims: scaledParamArgDims,
      nestingDims: scaledNestingDims,
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
    labelDims.w,
    labelDims.h,
    paramArgsString,
    paramDimsList,
    nestingDims,
    hasPrevNotch,
    hasNextNotch,
    hasOutputNotch,
    generateOutline,
    svgToPx,
    pxToSvg,
    minArgNestHeight,
  ]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={svgToPx(dims.w)}
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
      {(isLabelWidget || isVariantWidget || isGraphicWidget) && (
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
                    className={cn(
                      'h-7 min-w-16 gap-1 bg-transparent px-2 py-1',
                      'transition-colors hover:bg-black/5 dark:hover:bg-white/5',
                    )}
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
              {isGraphicWidget && graphicSrc && (
                <img src={graphicSrc} alt="graphic widget" className="shrink-0 object-contain" />
              )}
            </div>
          </div>
        </foreignObject>
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

// ── Model-based variant ───────────────────────────────────────────────────────

/**
 * Renders a fixed-widget brick driven by a model instance.
 *
 * The model is the single source of truth for all rendering data. The component:
 *  1. Reads configuration (colors, widget, params, argDims, nesting) from `model`.
 *  2. Writes the measured widget dimensions back to `model.widgetDims` after layout.
 *  3. Registers a callback so that external model mutations (e.g. `model.argDims =
 *     [...]`) automatically trigger a React re-render via a `tick` counter.
 *
 * The existing `BrickViewFixed` component is unchanged and remains fully usable.
 */
export function BrickViewFixedWithModel(props: BrickViewFixedPropsWithModel) {
  const { model } = props;

  // ── Derive rendering data from the model ──────────────────────────────────

  const scaleLevel = model.scaleLevel ?? 2;
  const { brickScale, minWidth, minArgNestHeight, minWidgetParamHeight, fontSize, lineHeight } =
    SCALE_LEVEL_CONFIG[scaleLevel];

  // Param labels render slightly smaller than the main label.
  const PARAM_FONT_SCALE = 0.8;
  const paramFontSize = Math.round(fontSize * PARAM_FONT_SCALE);
  const paramLineHeight = Math.round(lineHeight * PARAM_FONT_SCALE);

  const pxToSvg = useCallback((px: number) => px / brickScale, [brickScale]);
  const svgToPx = useCallback((u: number) => u * brickScale, [brickScale]);

  // Tick counter: incremented by the model callback to force a re-render.
  const [, setTick] = useState(0);

  // ── Callback registration ─────────────────────────────────────────────────
  // Register once per model instance. The cleanup unregisters before the model
  // is swapped out or the component unmounts.
  useEffect(() => {
    model.registerUpdateCallback(() => setTick((t) => t + 1));
    return () => model.unregisterUpdateCallback();
  }, [model]);

  // ── Local layout state ────────────────────────────────────────────────────
  const [path, setPath] = useState('');
  const [dims, setDims] = useState<Size>({ w: 0, h: 0 });

  const [labelDims, setLabelDims] = useState<Size>({ w: 0, h: 0 });
  const [labelBounds, setLabelBounds] = useState<Bounds>({ x: 0, y: 0, w: 0, h: 0 });

  // Derive param/arg arrays and nesting configuration from the model.
  const isExpression = model.kind === 'expression';
  const isStatement = model.kind === 'statement';

  const modelParams: readonly (string | null)[] =
    isExpression || isStatement ? (model as ExpressionBrickModel | StatementBrickModel).params : [];
  const modelArgDims: (Size | null)[] =
    isExpression || isStatement
      ? (model as ExpressionBrickModel | StatementBrickModel).argDims
      : [];

  // Build paramArgs in the same shape BrickViewFixed expects, so we can reuse
  // the same layout effect logic verbatim.
  const paramArgs = modelParams.map((param, i) => ({
    param: param ?? undefined,
    argDims: modelArgDims[i] ?? null,
  }));

  const hasConnectionPrev = isStatement ? (model as StatementBrickModel).hasConnectionPrev : false;
  const hasConnectionNext = isStatement ? (model as StatementBrickModel).hasConnectionNext : false;

  const hasNesting = isStatement ? (model as StatementBrickModel).hasNesting : false;
  const nestingIsFolded = isStatement ? (model as StatementBrickModel).isNestingFolded : false;
  const nestingDimsRaw = isStatement ? (model as StatementBrickModel).nestingDims : null;

  const [paramDimsList, setParamDimsList] = useState<Size[]>(paramArgs.map(() => ({ w: 0, h: 0 })));
  const [paramBoundsList, setParamBoundsList] = useState<(Bounds | null)[]>([]);

  const labelRef = useRef<HTMLDivElement>(null);
  const paramRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  // ── Widget type flags (same logic as BrickViewFixed) ─────────────────────
  const isLabelWidget = model.widget.type === 'label';
  const isVariantWidget = model.widget.type === 'variant';
  const isGraphicWidget = model.widget.type === 'graphic';

  const labelText = model.widget.type === 'label' ? model.widget.text : '';
  const labelGlyph = model.widget.type === 'label' ? model.widget.glyph : undefined;
  const variantOptions = model.widget.type === 'variant' ? model.widget.options : [];
  const variantValue = model.widget.type === 'variant' ? model.widget.value : '';
  const graphicSrc = model.widget.type === 'graphic' ? model.widget.src : undefined;
  const widgetContent =
    model.widget.type === 'label'
      ? model.widget.text
      : model.widget.type === 'variant'
        ? model.widget.value
        : model.widget.type === 'graphic'
          ? model.widget.src
          : '';

  // ── Outline generator (same config as BrickViewFixed) ────────────────────
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

  const { hasPrevNotch, hasNextNotch, hasOutputNotch, nestingDims } = useMemo(() => {
    let computedNestingDims;
    let hasPrevNotch = false;
    let hasNextNotch = false;
    const hasOutputNotch = model.kind === 'value' || model.kind === 'expression';

    if (model.kind === 'statement') {
      hasPrevNotch = hasConnectionPrev;
      hasNextNotch = hasConnectionNext;
      if (hasNesting) {
        if (nestingIsFolded) {
          computedNestingDims = undefined;
        } else if (nestingDimsRaw) {
          computedNestingDims = { w: nestingDimsRaw.w, h: nestingDimsRaw.h };
        } else {
          computedNestingDims = null;
        }
      }
    }
    return { hasPrevNotch, hasNextNotch, hasOutputNotch, nestingDims: computedNestingDims };
  }, [
    model.kind,
    hasConnectionPrev,
    hasConnectionNext,
    hasNesting,
    nestingIsFolded,
    nestingDimsRaw,
  ]);

  // ── Layout Effect 1: Measure DOM label / param dimensions ─────────────────
  // After measuring, write widget dims back to the model so it stays in sync.
  useLayoutEffect(() => {
    if (labelRef.current) {
      const { width, height } = labelRef.current.getBoundingClientRect();
      setLabelDims((prev) =>
        width !== prev.w || height !== prev.h ? { w: width, h: height } : prev,
      );
      // Write measured dimensions back to the model (model stays in sync but
      // does NOT fire _notifyUpdate here to avoid a re-render loop).
      model.widgetDims = { w: width, h: height };
    }

    setParamDimsList((prev) => {
      let changed = false;
      const next = [...prev];
      paramRefs.current.forEach((el, i) => {
        if (el) {
          const { width, height } = el.getBoundingClientRect();
          if (width !== next[i]?.w || height !== next[i]?.h) {
            next[i] = { w: width, h: height };
            changed = true;
          }
        }
      });
      return changed ? next : prev;
    });
  }, [widgetContent, paramArgsString, fontSize, lineHeight, model]);

  // ── Layout Effect 2: Generate SVG outline from measured dimensions ─────────
  useLayoutEffect(() => {
    const scaledWidgetDims = { w: pxToSvg(labelDims.w), h: pxToSvg(labelDims.h) };

    const parsedParamArgs = JSON.parse(paramArgsString) as typeof paramArgs;
    const scaledParamArgDims = parsedParamArgs.map((pa, i) => ({
      param: pa.param
        ? { w: pxToSvg(paramDimsList[i]?.w ?? 0), h: pxToSvg(paramDimsList[i]?.h ?? 0) }
        : null,
      arg: pa.argDims
        ? { w: pxToSvg(pa.argDims.w), h: pxToSvg(pa.argDims.h) }
        : pa.param
          ? { w: 0, h: pxToSvg(minArgNestHeight) }
          : null,
    }));

    const scaledNestingDims =
      nestingDims !== undefined
        ? nestingDims === null
          ? null
          : { w: pxToSvg(nestingDims.w), h: pxToSvg(nestingDims.h) }
        : undefined;

    const {
      width,
      height,
      path: generatedPath,
      bounds,
    } = generateOutline.generate({
      strokeWidth: pxToSvg(2 /* STROKE_WIDTH */),
      widgetDims: scaledWidgetDims,
      paramArgDims: scaledParamArgDims,
      nestingDims: scaledNestingDims,
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
          b ? { x: svgToPx(b.x), y: svgToPx(b.y), w: svgToPx(b.w), h: svgToPx(b.h) } : null,
        ),
      );
    }
  }, [
    labelDims.w,
    labelDims.h,
    paramArgsString,
    paramDimsList,
    nestingDims,
    hasPrevNotch,
    hasNextNotch,
    hasOutputNotch,
    generateOutline,
    svgToPx,
    pxToSvg,
    minArgNestHeight,
  ]);

  // ── Render (identical structure to BrickViewFixed) ────────────────────────
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={svgToPx(dims.w)}
      height={svgToPx(dims.h)}
      className="overflow-visible"
    >
      <path
        d={path}
        transform={`scale(${brickScale})`}
        fill={model.colorsDefault.background}
        stroke={model.colorsDefault.border}
        strokeWidth={pxToSvg(2 /* STROKE_WIDTH */)}
      />

      {/* Main Widget */}
      {(isLabelWidget || isVariantWidget || isGraphicWidget) && (
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
                      color: model.colorsDefault.foreground,
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
                    className={cn(
                      'h-7 min-w-16 gap-1 bg-transparent px-2 py-1',
                      'transition-colors hover:bg-black/5 dark:hover:bg-white/5',
                    )}
                    style={{
                      fontSize,
                      lineHeight: `${lineHeight}px`,
                      color: model.colorsDefault.foreground,
                      borderColor: model.colorsDefault.border,
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
                      backgroundColor: model.colorsDefault.background,
                      borderColor: model.colorsDefault.border,
                      color: model.colorsDefault.foreground,
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
              {isGraphicWidget && graphicSrc && (
                <img src={graphicSrc} alt="graphic widget" className="shrink-0 object-contain" />
              )}
            </div>
          </div>
        </foreignObject>
      )}

      {/* Parameters */}
      {paramArgs.map((pa, i) => {
        const paramText = pa.param;
        if (!paramText) return null;

        const b = paramBoundsList[i] || { x: 0, y: 0, w: 0, h: 0 };

        return (
          <foreignObject key={i} x={b.x} y={b.y} width={b.w || 9999} height={b.h || 9999}>
            <div
              className="flex items-center"
              style={{
                width: b.w || undefined,
                height: b.h || undefined,
              }}
            >
              <p
                ref={(el) => {
                  paramRefs.current[i] = el;
                }}
                className="m-0 max-w-none whitespace-nowrap"
                style={{
                  fontSize: paramFontSize,
                  lineHeight: `${paramLineHeight}px`,
                  color: model.colorsDefault.foreground,
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
