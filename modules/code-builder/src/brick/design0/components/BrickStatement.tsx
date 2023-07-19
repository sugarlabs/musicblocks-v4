import type { JSX } from 'react';
import type { IBrickStatement, TBrickCoords } from '@/@types/brick';

// -------------------------------------------------------------------------------------------------

export default function ({
  instance,
  coords = { x: 0, y: 0 },
}: {
  instance: IBrickStatement;
  coords?: TBrickCoords;
}): JSX.Element {
  return (
    <g transform={`translate(${coords?.x},${coords?.y}) scale(${instance.scale})`}>
      <path
        d={instance.SVGpath}
        style={{
          fill: instance.colorBg as string,
          fillOpacity: 1,
          stroke: instance.outline as string,
          strokeWidth: 1,
          strokeLinecap: 'round',
          strokeOpacity: 1,
        }}
      />
    </g>
  );
}
