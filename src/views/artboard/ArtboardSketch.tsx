// -- types ----------------------------------------------------------------------------------------

import p5 from 'p5';
import { useEffect } from 'react';
import { getViewportDimensions } from '../../utils/ambience';

// -- model component definition -------------------------------------------------------------------
import ArtBoardDraw from '../../models/artboard/ArBoardDraw';
const artBoardDraw = new ArtBoardDraw();

/** This is a setup function.*/

const Sketch = (sketch: p5) => {
  // let turtle: _ITurtleModel;
  let moveForwardButton: p5.Element;
  const steps = 5;

  function moveForward(direction: string) {
    const initialX = artBoardDraw.getTurtleX();
    const initialY = artBoardDraw.getTurtleY();
    if (direction === 'right') {
      artBoardDraw.setTurtleX(initialX + steps);
      const finalX = artBoardDraw.getTurtleX();
      sketch.line(initialX, initialY, finalX, initialY);
    }
    if (direction === 'left') {
      artBoardDraw.setTurtleX(initialX - steps);
      const finalX = artBoardDraw.getTurtleX();
      sketch.line(initialX, initialY, finalX, initialY);
    }
    if (direction === 'up') {
      artBoardDraw.setTurtleY(initialY - steps);
      const finalY = artBoardDraw.getTurtleY();
      sketch.line(initialX, initialY, initialX, finalY);
    }
    if (direction === 'down') {
      artBoardDraw.setTurtleY(initialY + steps);
      const finalY = artBoardDraw.getTurtleY();
      sketch.line(initialX, initialY, initialX, finalY);
    }
  }
  sketch.setup = () => {
    const [width, height]: [number, number] = getViewportDimensions();
    sketch.createCanvas(width, height);
    sketch.background(230);
    moveForwardButton = sketch.createButton('Move Forward');
    moveForwardButton.mousePressed(moveForward);
    moveForwardButton.position(300, 0);
  };

  sketch.draw = () => {
    sketch.stroke(artBoardDraw.getStokeColor());
    sketch.strokeWeight(artBoardDraw.getStrokeWeight());
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
