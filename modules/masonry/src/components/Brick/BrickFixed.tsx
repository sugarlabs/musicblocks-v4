import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { BrickViewPropsWithModel } from '@/@types/brick.types';
import type { Bounds, Size } from '@/@types/common.types';

import type { ExpressionBrickModel, StatementBrickModel } from '@/models/brick';

import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { BrickOutlineGenerator } from '@/utils/brick-shape';
import { SCALE_LEVEL_CONFIG } from '@/utils/constants';

const STROKE_WIDTH = 2;
const DEFAULT_SCALE_LEVEL: keyof typeof SCALE_LEVEL_CONFIG = 2;
// Param labels render smaller than the main label so the brick's identity
// (the label) stays dominant while params read as secondary detail.
const PARAM_FONT_SCALE = 0.8;

/**
 * Renders a brick whose widget is fixed — no free user input. The variant widget is the sole
 * exception, using a select UI, but it remains semantically fixed: the brick represents a
 * predetermined concept, and the select only switches between its predefined forms.
 *
 * The model is the single source of truth for all rendering data. The component:
 *  1. Reads configuration (colors, widget, params, argDims, nesting) from `model`.
 *  2. Writes the measured widget dimensions back to `model.widgetDims` after layout.
 *  3. Re-renders automatically whenever the model notifies a state change.
 */
export function BrickViewFixed(props: BrickViewPropsWithModel) {
  const { model } = props;

  // ── Model reactivity ─────────────────────────────────────────────────────────
  const [, setTick] = useState(0);
  useEffect(() => {
    const cb = () => setTick((t) => t + 1);
    model.registerUpdateCallback(cb);
    return () => model.unregisterUpdateCallback(cb);
  }, [model]);

  // ── Read from model ───────────────────────────────────────────────────────────
  const scaleLevel = model.scaleLevel ?? DEFAULT_SCALE_LEVEL;
  const { brickScale, minWidth, minArgNestHeight, minWidgetParamHeight, fontSize, lineHeight } =
    SCALE_LEVEL_CONFIG[scaleLevel];

  const colorsDefault = model.colorsDefault;
  const widget = model.widget;

  // Param labels share the main label's color but render at a smaller size.
  const paramFontSize = Math.round(fontSize * PARAM_FONT_SCALE);
  const paramLineHeight = Math.round(lineHeight * PARAM_FONT_SCALE);

  const pxToSvg = useCallback((px: number) => px / brickScale, [brickScale]);
  const svgToPx = useCallback((u: number) => u * brickScale, [brickScale]);

  // Build paramArgs from the model's separate params[] and argDims[] arrays.
  const paramArgs: { param?: string; argDims: Size | null }[] =
    model.kind === 'expression' || model.kind === 'statement'
      ? (() => {
          const m = model as ExpressionBrickModel | StatementBrickModel;
          return m.params.map((p, i) => ({ param: p ?? undefined, argDims: m.argDims[i] ?? null }));
        })()
      : [];

  // Statement-only connection notches and nesting
  const hasConnectionPrev =
    model.kind === 'statement' ? (model as StatementBrickModel).hasConnectionPrev : false;
  const hasConnectionNext =
    model.kind === 'statement' ? (model as StatementBrickModel).hasConnectionNext : false;
  const hasNesting = model.kind === 'statement' && (model as StatementBrickModel).hasNesting;
  const nestingIsFolded =
    model.kind === 'statement' ? (model as StatementBrickModel).isNestingFolded : false;
  const nestingDimsW =
    model.kind === 'statement' ? (model as StatementBrickModel).nestingDims?.w : undefined;
  const nestingDimsH =
    model.kind === 'statement' ? (model as StatementBrickModel).nestingDims?.h : undefined;

  // ── Local layout state ───────────────────────────────────────────────────────
  const [path, setPath] = useState('');
  const [dims, setDims] = useState<Size>({ w: 0, h: 0 });

  const [labelDims, setLabelDims] = useState<Size>({ w: 0, h: 0 });
  const [labelBounds, setLabelBounds] = useState<Bounds>({ x: 0, y: 0, w: 0, h: 0 });

  const [paramDimsList, setParamDimsList] = useState<Size[]>(paramArgs.map(() => ({ w: 0, h: 0 })));
  const [paramBoundsList, setParamBoundsList] = useState<(Bounds | null)[]>([]);

  const labelRef = useRef<HTMLDivElement>(null);
  const paramRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const isLabelWidget = widget.type === 'label';
  const isVariantWidget = widget.type === 'variant';
  const isGraphicWidget = widget.type === 'graphic';

  const labelText = widget.type === 'label' ? widget.text : '';
  const labelGlyph = widget.type === 'label' ? widget.glyph : undefined;

  const variantOptions: string[] = widget.type === 'variant' ? widget.options : [];
  const variantValue = widget.type === 'variant' ? widget.value : '';

  const graphicSrc = widget.type === 'graphic' ? widget.src : undefined;

  const widgetContent =
    widget.type === 'label'
      ? widget.text
      : widget.type === 'variant'
        ? widget.value
        : widget.type === 'graphic'
          ? widget.src
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
        } else if (nestingDimsW !== undefined && nestingDimsH !== undefined) {
          computedNestingDims = { w: nestingDimsW, h: nestingDimsH };
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
    nestingDimsW,
    nestingDimsH,
  ]);

  // Layout Effect 1: Measures the actual rendered DOM text dimensions.
  // fontSize and lineHeight are deps so that scaleLevel changes correctly recalculate width/height.
  // Writes the measured widget dimensions back to model.widgetDims so it stays in sync.
  // widgetDims intentionally does NOT fire _notifyUpdate to avoid a measure → re-render loop.
  useLayoutEffect(() => {
    if (labelRef.current) {
      const { width, height } = labelRef.current.getBoundingClientRect();
      setLabelDims((prev) =>
        width !== prev.w || height !== prev.h ? { w: width, h: height } : prev,
      );
      model.widgetDims = { w: width, h: height };
    }

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

    // Write the measured param label dims back to model.paramDims (like widgetDims above) so
    // the model's computed dims and bounds match the rendered outline.
    if (model.kind === 'expression' || model.kind === 'statement') {
      paramRefs.current.forEach((el, i) => {
        if (el) {
          const { width, height } = el.getBoundingClientRect();
          model.paramDims[i] = { w: width, h: height };
        }
      });
    }
  }, [widgetContent, paramArgsString, fontSize, lineHeight, model]);

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
        fill={colorsDefault.background}
        stroke={colorsDefault.border}
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
                      color: colorsDefault.foreground,
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
                      color: colorsDefault.foreground,
                      borderColor: colorsDefault.border,
                    }}
                  >
                    <div className="grid">
                      <span
                        className="pointer-events-none invisible col-start-1 row-start-1 w-max"
                        aria-hidden="true"
                      >
                        {variantOptions.reduce(
                          (a: string, b: string) => (a.length > b.length ? a : b),
                          '',
                        )}
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
                      backgroundColor: colorsDefault.background,
                      borderColor: colorsDefault.border,
                      color: colorsDefault.foreground,
                    }}
                  >
                    {variantOptions.map((opt: string) => (
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
                  fontSize: paramFontSize,
                  lineHeight: `${paramLineHeight}px`,
                  color: colorsDefault.foreground,
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
