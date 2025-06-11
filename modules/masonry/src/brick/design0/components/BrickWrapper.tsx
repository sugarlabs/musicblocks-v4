import React from 'react';
import {
  createBrickBlock,
  createBrickData,
  createBrickExpression,
  createBrickStatement,
} from '../brickFactory';
import BrickBlockComponent from './BrickBlock';
import BrickDataComponent from './BrickData';
import BrickExpressionComponent from './BrickExpression';
import BrickStatementComponent from './BrickStatement';
import type {
  TBrickRenderPropsBlock,
  TBrickRenderPropsData,
  TBrickRenderPropsExpression,
  TBrickRenderPropsStatement,
  TCoords,
} from '@/@types/brick';

type TBrickWrapperProps =
  | { type: 'block'; params: TBrickRenderPropsBlock; coords?: TCoords }
  | { type: 'data'; params: TBrickRenderPropsData; coords?: TCoords }
  | { type: 'expression'; params: TBrickRenderPropsExpression; coords?: TCoords }
  | { type: 'statement'; params: TBrickRenderPropsStatement; coords?: TCoords };

const BrickWrapper: React.FC<TBrickWrapperProps> = ({ type, params, coords }) => {
  switch (type) {
    case 'block': {
      const instance = createBrickBlock({
        name: params.label,
        label: params.label,
        glyph: params.glyph || '',
        args: params.labelArgs.map((label, index) => ({ id: `arg${index}`, label })),
        colorBg: params.colorBg,
        colorFg: params.colorFg,
        colorBgHighlight: params.colorBg,
        colorFgHighlight: params.colorFg,
        outline: params.outline,
        scale: params.scale,
        connectAbove: true,
        connectBelow: true,
        nestLengthY: 0,
        folded: params.folded,
      });
      return <BrickBlockComponent instance={instance.renderProps} coords={coords} />;
    }
    case 'data': {
      const instance = createBrickData({
        name: params.label,
        label: params.label,
        glyph: params.glyph || '',
        dynamic: true,
        colorBg: params.colorBg,
        colorFg: params.colorFg,
        colorBgHighlight: params.colorBg,
        colorFgHighlight: params.colorFg,
        outline: params.outline,
        scale: params.scale,
      });
      return <BrickDataComponent instance={instance.renderProps} coords={coords} />;
    }
    case 'expression': {
      const instance = createBrickExpression({
        name: params.label,
        label: params.label,
        glyph: params.glyph || '',
        args: params.labelArgs.reduce((acc, label, index) => {
          acc[`arg${index}`] = { label, dataType: 'unknown', meta: {} };
          return acc;
        }, {} as Record<string, { label: string; dataType: string; meta: unknown }>),
        colorBg: params.colorBg,
        colorFg: params.colorFg,
        colorBgHighlight: params.colorBg,
        colorFgHighlight: params.colorFg,
        outline: params.outline,
        scale: params.scale,
      });
      return <BrickExpressionComponent instance={instance.renderProps} coords={coords} />;
    }
    case 'statement': {
      const instance = createBrickStatement({
        name: params.label,
        label: params.label,
        glyph: params.glyph || '',
        args: params.labelArgs.reduce((acc, label, index) => {
          acc[`arg${index}`] = { label, dataType: 'unknown', meta: {} };
          return acc;
        }, {} as Record<string, { label: string; dataType: string; meta: unknown }>),
        colorBg: params.colorBg,
        colorFg: params.colorFg,
        colorBgHighlight: params.colorBg,
        colorFgHighlight: params.colorFg,
        outline: params.outline,
        scale: params.scale,
        connectAbove: true,
        connectBelow: true,
      });
      return <BrickStatementComponent instance={instance.renderProps} coords={coords} />;
    }
    default:
      return null;
  }
};

export default BrickWrapper;
