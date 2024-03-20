import type { DOMAttributes, JSX } from 'react';
import type { Brick } from 'playground/pages/WorkSpace/data';

export default function ({
  brickData,
  moveProps,
  coords,
  color,
}: {
  brickData: Brick;
  moveProps: DOMAttributes<unknown>;
  coords: { x: number; y: number };
  color: string;
}): JSX.Element {
  return (
    <g
      {...moveProps}
      transform={`translate(${coords.x},${coords.y}) scale(${brickData.instance.scale})`}
      tabIndex={0}
    >
      <path
        d={brickData.instance.SVGpath}
        style={{
          fill: color,
          fillOpacity: 1,
          stroke: brickData.instance.outline as string,
          strokeWidth: 1,
          strokeLinecap: 'round',
          strokeOpacity: 1,
        }}
      />
    </g>
  );
}
