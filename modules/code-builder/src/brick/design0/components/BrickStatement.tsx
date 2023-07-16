import type { JSX } from 'react';
import type { IBrickStatement } from '@/@types/brick';

// -------------------------------------------------------------------------------------------------

export default function (props: { instance: IBrickStatement }): JSX.Element {
  const { instance } = props;

  return (
    <g transform={`scale(${instance.scale})`}>
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
