import type { Bounds, Size, StatementBrickViewProps } from '@/@types/brick';

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { SCALE_LEVEL_CONFIG } from '../../utils/constants';
import { createBrickOutlineGenerator } from '../../utils/path2';

const STROKE_WIDTH = 2;
const DEFAULT_SCALE_LEVEL: keyof typeof SCALE_LEVEL_CONFIG = 2;

export function BrickView(props: StatementBrickViewProps) {
  const { brickScale, minWidth, minArgNestHeight, minLabelParamHeight, fontSize, lineHeight } =
    SCALE_LEVEL_CONFIG[props.scaleLevel ?? DEFAULT_SCALE_LEVEL];

  const pxToSvg = useCallback((px: number) => px / brickScale, [brickScale]);
  const svgToPx = useCallback((u: number) => u * brickScale, [brickScale]);

  const [path, setPath] = useState('');
  const [dims, setDims] = useState<Size>({ w: 0, h: 0 });

  const [labelDims, setLabelDims] = useState<Size>({ w: 0, h: 0 });
  const [labelBounds, setLabelBounds] = useState<Bounds>({ x: 0, y: 0, w: 0, h: 0 });

  const labelRef = useRef<HTMLParagraphElement>(null);

  const labelText = props.widget.type === 'label' ? props.widget.text : '';

  const generateOutline = useMemo(
    () =>
      createBrickOutlineGenerator({
        minWidth: pxToSvg(minWidth),
        minLabelHeight: pxToSvg(minLabelParamHeight),
        minNestHeight: pxToSvg(minArgNestHeight),
        minParamHeight: pxToSvg(minLabelParamHeight),
        minArgHeight: pxToSvg(minArgNestHeight),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Measure the rendered label so the SVG outline can be sized to fit it.
  // Must run after paint so getBoundingClientRect reflects actual layout.
  useLayoutEffect(() => {
    const labelElem = labelRef.current;

    if (!labelElem) return;

    const { width, height } = labelElem.getBoundingClientRect();
    setLabelDims({ w: width, h: height });
  }, [labelText]);

  // Recompute the brick outline whenever the label dimensions change,
  // i.e. after the measurement effect above has committed its state update.
  useLayoutEffect(() => {
    const { width, height, path, bounds } = generateOutline({
      strokeWidth: pxToSvg(STROKE_WIDTH),
      labelDims: { w: pxToSvg(labelDims.w), h: pxToSvg(labelDims.h) },
      paramArgDims: [],
      nestingDims: props.nesting ? props.nesting?.dims : undefined,
      hasTopNotch: props.hasConnectionPrev,
      hasBottomNotch: props.hasConnectionNext,
    });

    setPath(path);
    setDims({ w: width, h: height });
    setLabelBounds({
      x: svgToPx(bounds.label.x),
      y: svgToPx(bounds.label.y),
      w: svgToPx(bounds.label.w),
      h: svgToPx(bounds.label.h),
    });
  }, [labelDims, generateOutline, svgToPx, pxToSvg, props]);

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
        fill="#0000001a"
        stroke="#555"
        strokeWidth={pxToSvg(STROKE_WIDTH)}
      />

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
          <p
            ref={labelRef}
            className="m-0 max-w-[unset] font-sans font-semibold whitespace-nowrap"
            style={{
              fontSize,
              lineHeight: `${lineHeight}px`,
            }}
          >
            {labelText}
          </p>
        </div>
      </foreignObject>
    </svg>
  );
}
