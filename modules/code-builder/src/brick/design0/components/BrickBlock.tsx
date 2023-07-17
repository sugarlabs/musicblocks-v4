import type { IBrickBlock } from '@/@types/brick';
import { useEffect, useRef, useState } from 'react';

// -------------------------------------------------------------------------------------------------

export default function (props: { instance: IBrickBlock }): JSX.Element {
  const { instance } = props;
  const [svgString, setSvgString] = useState<string>('');
  const label = useRef<SVGTextElement>(null);
  const [argLabels, setArgLabels] = useState<string[]>([]);

  useEffect(() => {
    const labelWidth = label.current?.getBBox();
    const args = instance.args;
    let argMaxWidth = 0;
    for (let arg in args) {
      setArgLabels((argLabels) => [...argLabels, args[arg].label]);
      argMaxWidth = Math.max(argMaxWidth, args[arg].label.length);
    }
    const width = (labelWidth?.width as number) + argMaxWidth * 12.8 + 40;
    instance.labelWidth = width;
    setSvgString(instance.SVGpaths[0]);
  }, []);

  return (
    <g transform={`scale(${instance.scale})`} id="svg1">
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
        x="12%"
        y="8%"
        dominantBaseline="middle"
        style={{
          fontSize: '0.8em',
        }}
      >
        {instance.label}
      </text>
      {argLabels.map((argLabel, index) => (
        <text
          key={index}
          x={`${(label.current?.getBBox().width as number) + (index + 1)}%`}
          y="8%"
          dominantBaseline="middle"
          style={{
            fontSize: '0.8em',
          }}
        >
          {argLabel}
        </text>
      ))}
    </g>
  );
}
