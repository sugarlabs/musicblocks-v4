// -- types ----------------------------------------------------------------------------------------

import p5 from 'p5';
import { useEffect } from 'react';
import { getViewportDimensions } from '../../utils/ambience';

// -- model component definition -------------------------------------------------------------------
import _ITurtleModel from '../../models/artboard/Turtle';

/** This is a setup function.*/

export const Sketch = (sketch: p5) => {
  let turtle: _ITurtleModel;
  sketch.setup = () => {
    const [width, height]: [number, number] = getViewportDimensions();
    sketch.createCanvas(width, height);
    turtle = new _ITurtleModel(2, 400, 300, 50, 50, sketch);
  };
  /** This is a draw function. */
  sketch.draw = () => {
    sketch.background(50);
    sketch.clear();
    turtle.over();
    // turtle.y += 1;
    turtle.update();
    turtle.show();
  };
  sketch.mousePressed = () => {
    turtle.pressed();
    // sketch.loop();
  };

  sketch.mouseReleased = () => {
    turtle.released();
    sketch.noLoop();
  };
};

/**
 * Class representing the Model of the Artboard component.
 */
export default function ArtboardSketch(props: { index: number }): JSX.Element {
  /** Stores the value of the auto hide state. */

  const id = `art-board-${props.index}`;
  useEffect(() => {
    new p5(Sketch, document.getElementById(id) as HTMLElement);
  }, []);

  return <div id={id} />;
}
