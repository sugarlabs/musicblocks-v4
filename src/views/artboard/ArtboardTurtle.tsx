// -- types ----------------------------------------------------------------------------------------

import p5 from 'p5';
import React, { useEffect, useState, createRef } from 'react';
import {
  P5Instance,
  SketchProps,
  P5WrapperTurtleProps,
  IArtboardModel,
} from '../../@types/artboard';
import { getViewportDimensions } from '../../utils/ambience';
// -- model component definition -------------------------------------------------------------------

/** This is a setup function.*/
let artBoardList: IArtboardModel[];
export const turtleSketch = (sketch: P5Instance): void => {
  let color = 'red';
  sketch.setup = () => {
    const [width, height]: [number, number] = getViewportDimensions();
    sketch.createCanvas(width, height);
    sketch.rectMode(sketch.CENTER);
    sketch.clear();
    sketch.angleMode(sketch.DEGREES);
  };

  sketch.updateWithProps = (props: SketchProps) => {
    if (props.color) {
      color = props.color;
    }
  };

  sketch.draw = () => {
    sketch.clear();
    artBoardList.map((artboard) => artboard._turtle.render(sketch));

    // turtleList.map((turtle: ITurtleModel) => turtle.render(sketch));
    sketch.fill(color);
  };
};

/**
 * Class representing the Model of the Artboard component.
 */
export const ArtboardTurtleSketch: React.FC<P5WrapperTurtleProps> = ({
  sketch,
  children,
  ...props
}) => {
  /** Stores the value of the auto hide state. */
  const artboardTurtleSketch = createRef<HTMLDivElement>();
  const id = `art-board-turtle-${props.index}`;
  const [instance, setInstance] = useState<P5Instance>();

  useEffect(() => {
    instance?.updateWithProps?.(props);
  }, [props]);
  useEffect(() => {
    artBoardList = props.artBoardList;
  }, [props.artBoardList]);
  useEffect(() => {
    if (artboardTurtleSketch.current === null) return;
    instance?.remove();

    const canvas = new p5(turtleSketch, artboardTurtleSketch.current);
    setInstance(canvas);
  }, [sketch, artboardTurtleSketch.current]);

  return (
    <div id={id} ref={artboardTurtleSketch}>
      {children}
    </div>
  );
};
