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
  function moveForwardPart(direction: string) {
    const initialX = artBoardDraw.getTurtleX();
    const initialY = artBoardDraw.getTurtleY();

    if (direction === 'forward') {
      const finalX = initialX + steps * sketch.cos(artBoardDraw.getTurtleAngle());
      const finalY = initialY - steps * sketch.sin(artBoardDraw.getTurtleAngle());

      sketch.line(initialX, initialY, finalX, finalY);

      artBoardDraw.setTurtleX(finalX);
      artBoardDraw.setTurtleY(finalY);
    }
    if (direction === 'back') {
      const finalX = initialX - steps * sketch.cos(artBoardDraw.getTurtleAngle());
      const finalY = initialY + steps * sketch.sin(artBoardDraw.getTurtleAngle());

      sketch.line(initialX, initialY, finalX, finalY);

      artBoardDraw.setTurtleX(finalX);
      artBoardDraw.setTurtleY(finalY);
    }
  }

  /**
   *
   * @param angle Angle by which the turtle should be rotated
   */
  function rotateTurtle(angle: number) {
    const initialAngle = artBoardDraw.getTurtleAngle();
    artBoardDraw.setTurleAngle((initialAngle + angle) % 360);
  }
  function moveForward(steps: number, direction: string) {
    let counter = 0;
    const moveForwardInterval = setInterval(() => {
      moveForwardPart(direction);
      counter++;
      if (counter === steps) {
        clearInterval(moveForwardInterval);
      }
    }, 75);
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
    let centerX = artBoardDraw.getTurtleX() + radius * sketch.cos(artBoardDraw.getTurtleAngle());
    let centerY = artBoardDraw.getTurtleY() + radius * sketch.sin(artBoardDraw.getTurtleAngle());
  }

  function play() {
    setInterval(() => {
      rotateTurtle(30);
      moveForward(20, 'forward');
      artBoardDraw.setStrokeColor(sketch.random(255), sketch.random(255), sketch.random(255));
    }, 75 * 20);
    // setTimeout(() => {

    // });
  }
  sketch.setup = () => {
    const [width, height]: [number, number] = getViewportDimensions();
    sketch.createCanvas(width, height);
    sketch.background(230);
    moveForwardButton = sketch.createButton('Play');
    moveForwardButton.mousePressed(play);
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
