import type { IBrickData, TBrickArgDataType, TBrickColor } from '@/@types/brick';

import BrickWrapper from './BrickWrapper';

// -------------------------------------------------------------------------------------------------

export default function (props: {
  Component: (props: { instance: IBrickData }) => JSX.Element;
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
}): JSX.Element {
  const { Component, prototype, label, colorBg, colorFg, outline, scale } = props;

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
    <BrickWrapper>
      <Component instance={instance} />
    </BrickWrapper>
  );
}
