import type { IBrickExpression } from '@/@types/brick';
import { useEffect, useRef, useState } from 'react';

// -------------------------------------------------------------------------------------------------

export default function (props: { instance: IBrickExpression }): JSX.Element {
  const { instance } = props;
  const [svgString, setSvgString] = useState<string>('');
  const [argLabels, setArgLabels] = useState<string[]>([]);
  const labelRef = useRef<SVGTextElement>(null);
  const argsRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const labelWidth = labelRef.current?.getBBox();
    const args = instance.args;
    for (let arg in args) {
      setArgLabels((argLabels) => [...argLabels, args[arg].label]);
    }
    const width = labelWidth?.width as number;
    instance.labelWidth = width;
  }, [instance]);

  useEffect(() => {
    let argsWidth = argsRef.current?.getBBox().width;
    if (argsWidth && argsWidth > 0) {
      argsWidth += 15;
    } else {
      argsWidth = 20;
    }
    instance.labelWidth += argsWidth as number;
    setSvgString(instance.SVGpaths[0]);
  }, [argLabels, instance]);

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
        ref={labelRef}
        x="20px"
        y="11px"
        dominantBaseline="middle"
        style={{
          fontSize: '0.8em',
        }}
      >
        {instance.label}
      </text>
      <g ref={argsRef}>
        {argLabels.map((argLabel, index) => (
          <text
            key={index}
            x="30%"
            y={`${index == 0 ? 8 : 5 * index + (index + 1) * 8}%`}
            dominantBaseline="middle"
            style={{
              fontSize: '0.8em',
            }}
          >
            {argLabel}
          </text>
        ))}
      </g>
    </g>
  );
}
