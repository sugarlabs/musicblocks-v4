import type { IBrickBlock, TBrickArgDataType, TBrickColor } from '@/@types/brick';

import BrickWrapper from './BrickWrapper';

// -------------------------------------------------------------------------------------------------

export default function (props: {
  Component: (props: { instance: IBrickBlock; visualIndicators?: JSX.Element }) => JSX.Element;
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
    connectAbove: true,
    connectBelow: true,
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
    </>
  );

  return (
    <BrickWrapper>
      <Component instance={instance} visualIndicators={<VisualIndicators />} />
    </BrickWrapper>
  );
}
