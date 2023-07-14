import BrickWrapper from './BrickWrapper';
import type { JSX } from 'react';
import type { IBrickData, TBrickArgDataType, TBrickColor } from '@/@types/brick';

// -------------------------------------------------------------------------------------------------

export default function (props: {
  Component: (props: { instance: IBrickData; visualIndicators?: JSX.Element }) => JSX.Element;
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

  const VisualIndicators = () => (
    <>
      {/* Overall Bounding Box of the Brick */}
      {/* <rect
        x={instance.bBoxBrick.coords.x}
        y={instance.bBoxBrick.coords.y}
        height={instance.bBoxBrick.extent.height}
        width={instance.bBoxBrick.extent.width}
        fill="green"
        opacity={0.2}
      /> */}

      {/* Left notch bounding box */}
      <rect
        x={instance.bBoxNotchArg.coords.x}
        y={instance.bBoxNotchArg.coords.y}
        height={instance.bBoxNotchArg.extent.height}
        width={instance.bBoxNotchArg.extent.width}
        fill="green"
        opacity={0.8}
      />
    </>
  );

  return (
    <BrickWrapper>
      <Component instance={instance} visualIndicators={<VisualIndicators />} />
    </BrickWrapper>
  );
}
