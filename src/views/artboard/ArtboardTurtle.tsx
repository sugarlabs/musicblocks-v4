// -- types ----------------------------------------------------------------------------------------

import p5 from 'p5';
import { useEffect } from 'react';
import { turtle } from '../../models/artboard/Turtle';
import { getViewportDimensions } from '../../utils/ambience';

// -- model component definition -------------------------------------------------------------------

/** This is a setup function.*/

const turtleSketch = (sketch: p5) => {
  let shape: import('p5');
  let angle = 0;
  sketch.setup = () => {
    const [width, height]: [number, number] = getViewportDimensions();
    sketch.createCanvas(width, height);
    sketch.rectMode(sketch.CENTER);
    sketch.clear();
    sketch.angleMode(sketch.DEGREES);
  };

  sketch.draw = () => {
    sketch.clear();
    sketch.translate(turtle.getTurtleX(), turtle.getTurtleY());
    sketch.rotate(90 - turtle.getTurtleAngle());

    sketch.rect(0, 0, 30, 60);
  };
};

/**
 * Class representing the Model of the Artboard component.
 */
export default function ArtboardSketch(props: { index: number }): JSX.Element {
  /** Stores the value of the auto hide state. */

  const id = `art-board-${props.index}`;
  useEffect(() => {
    new p5(turtleSketch, document.getElementById(id) as HTMLElement);
  }, []);

  return <div id={id} />;
}
