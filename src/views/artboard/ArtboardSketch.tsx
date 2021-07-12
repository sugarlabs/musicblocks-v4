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

  /**
   *
   * @param direction In which direction to draw the line
   */
  function moveForward(direction: string) {
    const initialX = artBoardDraw.getTurtleX();
    const initialY = artBoardDraw.getTurtleY();
    if (direction === 'forward') {
      artBoardDraw.setTurtleX(initialX + steps);
      const finalX = artBoardDraw.getTurtleX();
      sketch.line(initialX, initialY, finalX, initialY);
    }
    if (direction === 'back') {
      artBoardDraw.setTurtleX(initialX - steps);
      const finalX = artBoardDraw.getTurtleX();
      sketch.line(initialX, initialY, finalX, initialY);
    }
  }
  /**
   *
   * @param angle Angle by which the turtle should be rotated
   */
  function rotateTurtle(angle: number) {
    // functionality to rotate the turtle by an angle
  }

  /** Function called in makeArc to arc the arc in n small steps */
  function makeArcSteps() {
    // functionality
  }
  /**
   *
   * @param radius Radius for the arc
   * @param angle The angle of the arc
   */
  function makeArc(radius: number, angle: number) {
    let centerX =
      artBoardDraw.getTurtleX() + radius * sketch.cos(artBoardDraw.getTurtleAngle() - angle);
    let centerY =
      artBoardDraw.getTurtleY() + radius * sketch.sin(artBoardDraw.getTurtleAngle() - angle);
  }
  sketch.setup = () => {
    const [width, height]: [number, number] = getViewportDimensions();
    sketch.createCanvas(width, height);
    sketch.background(230);
    moveForwardButton = sketch.createButton('Make Arc');
    moveForwardButton.mousePressed(makeArc);
    moveForwardButton.position(300, 0);
    sketch.angleMode(sketch.DEGREES);
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
