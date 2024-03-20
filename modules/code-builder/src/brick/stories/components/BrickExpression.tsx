import BrickWrapper from './BrickWrapper';
import type { JSX } from 'react';
import type { IBrickExpression, TBrickArgDataType, TBrickColor } from '@/@types/brick';

// -------------------------------------------------------------------------------------------------

export default function (props: {
  Component: (props: { instance: IBrickExpression; visualIndicators?: JSX.Element }) => JSX.Element;
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

  const VisualIndicators = () => (
    <>
      {/* Overall Bounding Box of the Brick */}
      <rect
        x={instance.bBoxBrick.coords.x}
        y={instance.bBoxBrick.coords.y}
        height={instance.bBoxBrick.extent.height}
        width={instance.bBoxBrick.extent.width}
        fill="black"
        opacity={0.25}
      />

      {/* Right args bounding box */}
      {Object.keys(instance.bBoxArgs).map((name, i) => {
        const arg = instance.bBoxArgs[name];

        return (
          <rect
            key={i}
            x={arg.coords.x}
            y={arg.coords.y}
            height={arg.extent.height}
            width={arg.extent.width}
            fill="green"
            opacity={0.8}
          />
        );
      })}

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
      <Component instance={instance} />
      <VisualIndicators />
    </BrickWrapper>
  );
}
