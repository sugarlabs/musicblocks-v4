import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { Bounds, Size, ValueBrickViewProps, WidgetInput } from '@/@types/brick.types';

import { SCALE_LEVEL_CONFIG } from '@/utils/constants';
import { BrickOutlineGenerator } from '@/utils/path';

import { Widget } from './BrickWidget';

export type BrickViewInputProps = Omit<ValueBrickViewProps, 'widget'> & {
  widget: WidgetInput;
};

const STROKE_WIDTH = 2;
const DEFAULT_SCALE_LEVEL: keyof typeof SCALE_LEVEL_CONFIG = 2;

export function BrickViewInput(props: BrickViewInputProps) {
  const { brickScale, minWidth, minArgNestHeight, minWidgetParamHeight, fontSize, lineHeight } =
    SCALE_LEVEL_CONFIG[props.scaleLevel ?? DEFAULT_SCALE_LEVEL];

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

  // Layout Effect 1: Measures the actual rendered DOM dimensions of the input.
  // We use the inputRef to measure the physical pixel width of the rendered widget.
  // We use a ResizeObserver to continuously track changes (e.g. when typing in a textbox).
  useLayoutEffect(() => {
    if (!inputRef.current) return;

    const observer = new ResizeObserver(() => {
      if (inputRef.current) {
        const { width, height } = inputRef.current.getBoundingClientRect();
        setLabelDims((prev) => {
          if (prev.w !== width || prev.h !== height) {
            return { w: width, h: height };
          }
          return prev;
        });
      }
    });

    observer.observe(inputRef.current);

    // Initial measurement
    const { width, height } = inputRef.current.getBoundingClientRect();
    setLabelDims((prev) => {
      if (prev.w !== width || prev.h !== height) {
        return { w: width, h: height };
      }
      return prev;
    });

    return () => observer.disconnect();
  }, []);

  // Layout Effect 2: Generates the SVG outline path based on the measured dimensions.
  // This runs after labelDims updates. It creates the path, and calculates
  // the exact coordinates (labelBounds) where the foreignObject should be placed.
  useLayoutEffect(() => {
    const scaledWidgetDims = { w: pxToSvg(labelDims.w), h: pxToSvg(labelDims.h) };

    // Value bricks only have a left notch
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

    setLabelBounds({
      x: svgToPx(bounds.widget.x),
      y: svgToPx(bounds.widget.y),
      w: svgToPx(bounds.widget.w),
      h: svgToPx(bounds.widget.h),
    });
  }, [labelDims.w, labelDims.h, generateOutline, svgToPx, pxToSvg]);

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

      {/* foreignObject acts as a viewport embedding standard HTML inside the SVG */}
      <foreignObject
        x={labelBounds.x}
        y={labelBounds.y}
        // Initially labelBounds is 0. We use undefined so the HTML container is unconstrained
        // on the first pass, allowing inputRef to measure its true, natural width.
        width={labelBounds.w || undefined}
        height={labelBounds.h || undefined}
        style={{ overflow: 'visible' }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: labelBounds.w,
            height: labelBounds.h,
          }}
        >
          <div ref={inputRef} className="flex w-max shrink-0 items-center px-2">
            <Widget
              widget={props.widget}
              fontSize={fontSize}
              lineHeight={lineHeight}
              color={props.colorsDefault.foreground}
              borderColor={props.colorsDefault.border}
              backgroundColor={props.colorsDefault.background}
            />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
