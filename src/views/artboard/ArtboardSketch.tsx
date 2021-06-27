// -- types ----------------------------------------------------------------------------------------

import p5 from 'p5';
import { useEffect } from 'react';
import { getViewportDimensions } from '../../utils/ambience';

/** This is a setup function.*/

export const Sketch = (sketch: p5) => {
  sketch.setup = () => {
    const [width, height]: [number, number] = getViewportDimensions();
    sketch.createCanvas(width, height);
  };
  /** This is a draw function. */
  sketch.draw = () => {
    sketch.background(50);
    sketch.ellipse(sketch.mouseX, sketch.mouseY, 80, 80);
    if (sketch.mouseIsPressed) {
      sketch.background(23, 34, 56);
    } else {
      sketch.rect(25, 25, 50, 50);
    }
  };

  console.log(sketch);
};

// -- model component definition -------------------------------------------------------------------

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
