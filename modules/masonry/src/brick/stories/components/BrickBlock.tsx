import type { JSX } from 'react';
import type { IBrickBlock, TBrickRenderPropsBlock, TColor } from '@/@types/brick';

import BrickWrapper from './BrickWrapper';

// -------------------------------------------------------------------------------------------------

export default function (props: {
  View: React.FC<TBrickRenderPropsBlock>;
  Model: new (params: {
    uuid: string;
    name: string;

    label: string;
    glyph?: string;
    colorBg: TColor;
    colorFg: TColor;
    colorBgHighlight: TColor;
    colorFgHighlight: TColor;
    outline: TColor;
    connectAbove: boolean;
    connectBelow: boolean;

    args: {
      /** unique identifier of the argument */
      id: string;
      /** label for the argument */
      label: string;
    }[];
  }) => IBrickBlock;
  showIndicators: boolean;

  label: string;
  args: string[];
  colorBg: string;
  colorFg: string;
  outline: string;
  scale: number;
}): JSX.Element {
  const { View, Model, showIndicators, label, args, colorBg, colorFg, outline, scale } = props;

  const instance = new Model({
    uuid: '',
    name: '',

    label,
    colorBg,
    colorFg,
    colorBgHighlight: '',
    colorFgHighlight: '',
    outline,
    connectAbove: true,
    connectBelow: true,

    args: args.map((label, i) => ({ id: `label_${i}`, label })),
  });

  instance.scale = scale;

  const VisualIndicators = () => (
    <>
      {/* Overall Bounding Box of the Brick */}
      <rect
        x={0}
        y={0}
        height={instance.boundingBox.height}
        width={instance.boundingBox.width}
        fill="black"
        opacity={0.25}
      />

      {/* Connection point of Top */}
      <rect
        x={instance.connPointsFixed.insTop.coords.y}
        y={instance.connPointsFixed.insTop.coords.y}
        height={instance.connPointsFixed.insTop.extent.height}
        width={instance.connPointsFixed.insTop.extent.width}
        fill="green"
        opacity={0.75}
      />

      {/* Connection point of Bottom */}
      <rect
        x={instance.connPointsFixed.insBottom.coords.y}
        y={instance.connPointsFixed.insBottom.coords.y}
        height={instance.connPointsFixed.insBottom.extent.height}
        width={instance.connPointsFixed.insBottom.extent.width}
        fill="green"
        opacity={0.75}
      />

      {/* Connection point of Nesting */}
      <rect
        x={instance.connPointsFixed.insNest.coords.y}
        y={instance.connPointsFixed.insNest.coords.y}
        height={instance.connPointsFixed.insNest.extent.height}
        width={instance.connPointsFixed.insNest.extent.width}
        fill="green"
        opacity={0.75}
      />

      {/* Connection points of Args */}
      {Object.values(instance.connPointsArg).map(({ extent, coords }) => (
        <rect
          x={coords.y}
          y={coords.y}
          height={extent.height}
          width={extent.width}
          fill="purple"
          opacity={0.75}
        />
      ))}
    </>
  );

  return (
    <BrickWrapper>
      <View {...instance.renderProps} />
      {showIndicators && <VisualIndicators />}
    </BrickWrapper>
  );
}
