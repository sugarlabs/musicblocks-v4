import type { IBrickBlock, TBrickArgDataType, TBrickColor } from '@/@types/brick';

export type TBrickBlockProps = {
  prototype: new (params: {
    name: string;
    label: string;
    glyph: string;
    args: Record<
      string,
      {
        label: string;
        dataType: TBrickArgDataType;
        meta: unknown;
      }
    >;
    colorBg: TBrickColor;
    colorFg: TBrickColor;
    outline: TBrickColor;
    scale: number;
    connectAbove: boolean;
    connectBelow: boolean;
  }) => IBrickBlock;
  label: string;
  args: string[];
  colorBg: string;
  colorFg: string;
  outline: string;
  scale: number;
};

export default function (props: TBrickBlockProps): JSX.Element {
  const { prototype, label, args, colorBg, colorFg, outline, scale } = props;

  const instance = new prototype({
    label,
    args: Object.fromEntries(
      args.map<[string, { label: string; dataType: TBrickArgDataType; meta: unknown }]>((name) => [
        name,
        { label: name, dataType: 'any', meta: undefined },
      ]),
    ),
    colorBg,
    colorFg,
    outline,
    scale,
    glyph: '',
    connectAbove: true,
    connectBelow: true,
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
          strokeLinecap: 'round',
          strokeOpacity: 1,
        }}
      />
    </g>
  );
}
