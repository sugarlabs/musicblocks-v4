import { useLayoutEffect, useRef, useState } from 'react';

import type { Bounds, BrickViewProps, Size } from '../../../@types/brick';

import { generateBrickOutline2 as generateBrickOutline } from '../../utils/newPath';

const STROKE_WIDTH = 4;

export function BrickView(props: BrickViewProps) {
  const [path, setPath] = useState('');
  const [dims, setDims] = useState<Size>({ w: 0, h: 0 });

  const [labelDims, setLabelDims] = useState<Size>({ w: 0, h: 0 });
  const [labelBounds, setLabelBounds] = useState<Bounds>({ x: 0, y: 0, w: 0, h: 0 });

  const labelRef = useRef<HTMLParagraphElement>(null);

  // Measure the rendered label so the SVG outline can be sized to fit it.
  // Must run after paint so getBoundingClientRect reflects actual layout.
  useLayoutEffect(() => {
    const labelElem = labelRef.current;

    if (!labelElem) return;

    const { width, height } = labelElem.getBoundingClientRect();
    setLabelDims({ w: width, h: height });
  }, [props.label]);

  // Recompute the brick outline whenever the label dimensions change,
  // i.e. after the measurement effect above has committed its state update.
  useLayoutEffect(() => {
    const { width, height, path, bounds } = generateBrickOutline({
      strokeWidth: STROKE_WIDTH,
      labelDims: { w: labelDims.w, h: labelDims.h },
      paramArgDims: [],
    });

    setPath(path);
    setDims({ w: width, h: height });
    setLabelBounds(bounds.label);
  }, [labelDims]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={dims.w}
      height={dims.h}
      viewBox={`0 0 ${dims.w} ${dims.h}`}
    >
      <path d={path} fill="#0000001a" stroke="#555" strokeWidth={STROKE_WIDTH} />

      <foreignObject
        x={labelBounds.x}
        y={labelBounds.y}
        width={labelBounds.w || 9999}
        height={labelBounds.h || 9999}
      >
        <div
          style={{
            width: labelBounds.w,
            height: labelBounds.h,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <p
            ref={labelRef}
            style={{
              maxWidth: 'unset',
              margin: 0,
              fontSize: 14,
              lineHeight: '16px',
              whiteSpace: 'nowrap',
            }}
          >
            {props.label}
          </p>
        </div>
      </foreignObject>
    </svg>
  );
}
