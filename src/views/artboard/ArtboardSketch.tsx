// -- types ----------------------------------------------------------------------------------------

import p5 from 'p5';
import { useEffect } from 'react';
import { getViewportDimensions } from '../../utils/ambience';

// -- model component definition -------------------------------------------------------------------
import ArtBoardDraw from '../../models/artboard/ArBoardDraw';
import Turtle from '../../models/artboard/Turtle';
const artBoardDraw = new ArtBoardDraw();
const turtle = new Turtle();

/** This is a setup function.*/

const Sketch = (sketch: p5) => {
  // let turtle: _ITurtleModel;
  let moveForwardButton: p5.Element;
  const steps = 5;

  /**
   *
   * @param direction In which direction to draw the line
   */
  function moveForwardPart(i: number, direction: string) {
    setTimeout(function () {
      const initialX = turtle.getTurtleX();
      const initialY = turtle.getTurtleY();

      if (direction === 'forward') {
        const finalX = initialX + steps * sketch.cos(turtle.getTurtleAngle());
        const finalY = initialY - steps * sketch.sin(turtle.getTurtleAngle());

        sketch.line(initialX, initialY, finalX, finalY);

        turtle.setTurtleX(finalX);
        turtle.setTurtleY(finalY);
      }
      if (direction === 'back') {
        const finalX = initialX - steps * sketch.cos(turtle.getTurtleAngle());
        const finalY = initialY + steps * sketch.sin(turtle.getTurtleAngle());

        sketch.line(initialX, initialY, finalX, finalY);

        turtle.setTurtleX(finalX);
        turtle.setTurtleY(finalY);
      }
    }, 50 * i);
  }

  /**
   *
   * @param angle Angle by which the turtle should be rotated
   */
  function rotateTurtle(angle: number) {
    const initialAngle = turtle.getTurtleAngle();
    turtle.setTurleAngle((initialAngle + angle) % 360);
  }
  function moveForward(steps: number, direction: string) {
    for (let i = 0; i < steps; i++) {
      moveForwardPart(i, direction);
    }
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
    let centerX = turtle.getTurtleX() + radius * sketch.cos(turtle.getTurtleAngle());
    let centerY = turtle.getTurtleY() + radius * sketch.sin(turtle.getTurtleAngle());
  }

  function play() {
    setInterval(() => {
      rotateTurtle(30);
      moveForward(20, 'forward');
      artBoardDraw.setStrokeColor(sketch.random(255), sketch.random(255), sketch.random(255));
    }, 75 * 20);
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
