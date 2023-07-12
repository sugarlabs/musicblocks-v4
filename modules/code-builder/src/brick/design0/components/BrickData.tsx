import type { IBrickData } from '@/@types/brick';
import { useEffect, useRef, useState } from 'react';

export default function (props: { instance: IBrickData }): JSX.Element {
  const { instance } = props;
  const [svgString, setSvgString] = useState<string>('');
  const label = useRef<SVGTextElement>(null);

  useEffect(() => {
    const labelWidth = label.current?.getBBox();
    const padding = 15;
    const width = (labelWidth?.width as number) + padding;
    instance.labelWidth = width;
    setSvgString(instance.SVGpaths[0]);
  }, [instance]);

  return (
    <g transform={`scale(${instance.scale})`}>
      <path
        d={svgString}
        style={{
          fill: instance.colorBg as string,
          fillOpacity: 1,
          stroke: instance.outline as string,
          strokeWidth: 1,
          strokeLinecap: 'round',
          strokeOpacity: 1,
        }}
      />
      <text
        ref={label}
        x="15px"
        y="11px"
        dominantBaseline="middle"
        style={{
          fontSize: '0.8em',
        }}
      >
        {instance.label}
      </text>
    </g>
  );
}
