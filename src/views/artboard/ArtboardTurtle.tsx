// -- types ----------------------------------------------------------------------------------------

import p5 from 'p5';
import React, { useEffect, useState, createRef } from 'react';
import { P5Instance, SketchProps, P5WrapperProps } from '../../@types/artboard';
import { turtle } from '../../models/artboard/Turtle';
import { getViewportDimensions } from '../../utils/ambience';

// -- model component definition -------------------------------------------------------------------

/** This is a setup function.*/

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
    sketch.translate(turtle.getTurtleX(), turtle.getTurtleY());
    sketch.rotate(90 - turtle.getTurtleAngle());
    sketch.fill(color);
    sketch.noStroke();
    sketch.rect(0, 0, 30, 60);
  };
};

/**
 * Class representing the Model of the Artboard component.
 */
export const ArtboardTurtleSketch: React.FC<P5WrapperProps> = ({ sketch, children, ...props }) => {
  /** Stores the value of the auto hide state. */
  const artboardTurtleSketch = createRef<HTMLDivElement>();
  const id = `art-board-${props.index}`;
  const [instance, setInstance] = useState<P5Instance>();

  useEffect(() => {
    instance?.updateWithProps?.(props);
  }, [props]);

  useEffect(() => {
    if (artboardTurtleSketch.current === null) return;
    instance?.remove();
    const canvas = new p5(sketch, artboardTurtleSketch.current);
    setInstance(canvas);
  }, [sketch, artboardTurtleSketch.current]);

  return (
    <div id={id} ref={artboardTurtleSketch}>
      {children}
    </div>
  );
};
