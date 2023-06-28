import type { IBrickData, TBrickArgDataType, TBrickColor } from '@/@types/brick';

export type TBrickDataProps = {
  prototype: new (params: {
    name: string;
    label: string;
    glyph: string;
    dataType: TBrickArgDataType;
    dynamic: boolean;
    value?: boolean | number | string;
    input?: 'boolean' | 'number' | 'string' | 'options';
    colorBg: TBrickColor;
    colorFg: TBrickColor;
    outline: TBrickColor;
    scale: number;
  }) => IBrickData;
  label: string;
  colorBg: string;
  colorFg: string;
  outline: string;
  scale: number;
};

export default function (props: TBrickDataProps): JSX.Element {
  const { prototype, label, colorBg, colorFg, outline, scale } = props;

  const instance = new prototype({
    label,
    colorBg,
    colorFg,
    outline,
    scale,
    glyph: '',
    dynamic: false,
    dataType: 'any',
    name: '',
  });

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
