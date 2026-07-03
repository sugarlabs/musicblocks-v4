import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { ValueBrickViewPropsWithModel, WidgetInput } from '@/@types/brick.types';
import type { Bounds, Size } from '@/@types/common.types';

import type { ValueBrickModel } from '@/models/brick';

import { BrickOutlineGenerator } from '@/utils/brick-shape';
import { SCALE_LEVEL_CONFIG } from '@/utils/constants';

import { Widget } from './BrickWidget';

/**
 * Model-based prop type for BrickViewInput.
 * The model's widget must be a WidgetInput (interactive input control).
 * The existing BrickViewInputProps is preserved for backward compatibility.
 */
export type BrickViewInputPropsWithModel = ValueBrickViewPropsWithModel & {
  /** Narrows the model's widget to the interactive input type. */
  model: ValueBrickModel & { widget: WidgetInput };
};

const STROKE_WIDTH = 2;
const DEFAULT_SCALE_LEVEL: keyof typeof SCALE_LEVEL_CONFIG = 2;

/**
 * Value brick with an interactive input widget. Outline re-flows via `ResizeObserver`
 * as the widget changes size.
 *
 * The model is the single source of truth for all rendering data. The component:
 *  1. Reads configuration (colors, widget, scaleLevel) from `model`.
 *  2. Writes the measured widget dimensions back to `model.widgetDims` after layout.
 *  3. Re-renders automatically whenever the model notifies a state change.
 */
export function BrickViewInput(props: BrickViewInputPropsWithModel) {
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
  const widget: WidgetInput = model.widget;

  const pxToSvg = useCallback((px: number) => px / brickScale, [brickScale]);
  const svgToPx = useCallback((u: number) => u * brickScale, [brickScale]);

  const [path, setPath] = useState('');
  const [dims, setDims] = useState<Size>({ w: 0, h: 0 });

  const [labelDims, setLabelDims] = useState<Size>({ w: 0, h: 0 });
  const [labelBounds, setLabelBounds] = useState<Bounds>({ x: 0, y: 0, w: 0, h: 0 });

  const inputRef = useRef<HTMLDivElement>(null);

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

  // Layout Effect 1: Measures the actual rendered DOM dimensions of the input via ResizeObserver.
  // Writes the measured dimensions back to model.widgetDims so it stays in sync.
  // widgetDims intentionally does NOT fire _notifyUpdate to avoid a measure → re-render loop.
  useLayoutEffect(() => {
    if (!inputRef.current) return;

    const observe = (el: HTMLDivElement) => {
      const { width, height } = el.getBoundingClientRect();
      setLabelDims((prev) =>
        prev.w !== width || prev.h !== height ? { w: width, h: height } : prev,
      );
      model.widgetDims = { w: width, h: height };
    };

    const observer = new ResizeObserver(() => {
      if (inputRef.current) observe(inputRef.current);
    });

    observer.observe(inputRef.current);
    observe(inputRef.current);

    return () => observer.disconnect();
  }, [model]);

  // Layout Effect 2: Generates the SVG outline path based on the measured dimensions.
  useLayoutEffect(() => {
    const scaledWidgetDims = { w: pxToSvg(labelDims.w), h: pxToSvg(labelDims.h) };

    // Value bricks only have a left notch.
    const {
      width,
      height,
      path: generatedPath,
      bounds,
    } = generateOutline.generate({
      strokeWidth: pxToSvg(STROKE_WIDTH),
      widgetDims: scaledWidgetDims,
      paramArgDims: [],
      hasPrevNotch: false,
      hasNextNotch: false,
      hasOutputNotch: true,
    });

    setPath(generatedPath);
    setDims({ w: width, h: height });
    model.setDims(width, height);

    setLabelBounds({
      x: svgToPx(bounds.widget.x),
      y: svgToPx(bounds.widget.y),
      w: svgToPx(bounds.widget.w),
      h: svgToPx(bounds.widget.h),
    });
  }, [labelDims.w, labelDims.h, generateOutline, svgToPx, pxToSvg, model]);

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

      {/* foreignObject acts as a viewport embedding standard HTML inside the SVG */}
      <foreignObject
        x={labelBounds.x}
        y={labelBounds.y}
        // Initially labelBounds is 0. We use undefined so the HTML container is unconstrained
        // on the first pass, allowing inputRef to measure its true, natural width.
        width={labelBounds.w || 9999}
        height={labelBounds.h || 9999}
        style={{ overflow: 'visible' }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: labelBounds.w || undefined,
            height: labelBounds.h || undefined,
          }}
        >
          <div ref={inputRef} className="flex w-max shrink-0 items-center px-2">
            <Widget
              widget={widget}
              fontSize={fontSize}
              lineHeight={lineHeight}
              color={colorsDefault.foreground}
              borderColor={colorsDefault.border}
              backgroundColor={colorsDefault.background}
            />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
