import type { IBrickExpression, TBrickArgDataType, TBrickColor } from '@/@types/brick';

import BrickWrapper from './BrickWrapper';

// -------------------------------------------------------------------------------------------------

export default function (props: {
  Component: (props: { instance: IBrickExpression }) => JSX.Element;
  prototype: new (params: {
    name: string;
    label: string;
    glyph: string;
    dataType: TBrickArgDataType;
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
  }) => IBrickExpression;
  label: string;
  args: string[];
  colorBg: string;
  colorFg: string;
  outline: string;
  scale: number;
}): JSX.Element {
  const { Component, prototype, label, args, colorBg, colorFg, outline, scale } = props;

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
    dataType: 'any',
    name: '',
  });

  return (
    <BrickWrapper>
      <Component instance={instance} />
    </BrickWrapper>
  );
}
