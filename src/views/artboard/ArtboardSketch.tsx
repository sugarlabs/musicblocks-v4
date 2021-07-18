// -- types ----------------------------------------------------------------------------------------

import p5 from 'p5';
import { useEffect } from 'react';
import { getViewportDimensions } from '../../utils/ambience';

// -- model component definition -------------------------------------------------------------------
import ArtBoardDraw from '../../models/artboard/ArBoardDraw';
import { turtle } from '../../models/artboard/Turtle';
const artBoardDraw = new ArtBoardDraw();

/** This is a setup function.*/

const Sketch = (sketch: p5) => {
  let moveForwardButton: p5.Element;
  let rotateButton: p5.Element;
  let moveInArcButton: p5.Element;
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
  function rotateTurtlePart(i: number) {
    if (i < 0) {
      i = -1 * i;
      setTimeout(function () {
        const initialAngle = turtle.getTurtleAngle();
        turtle.setTurleAngle((initialAngle - 1) % 360);
      }, 10 * i);
    } else {
      setTimeout(function () {
        const initialAngle = turtle.getTurtleAngle();
        turtle.setTurleAngle((initialAngle + 1) % 360);
      }, 10 * i);
    }
  }
  /**
   *
   * @param angle Angle by which the turtle should be rotated
   */
  function rotateTurtle(angle: number) {
    if (angle < 0) {
      angle = -1 * angle;
      for (let i = 0; i < angle; i++) {
        rotateTurtlePart(-1 * i);
      }
    } else {
      for (let i = 0; i < angle; i++) {
        rotateTurtlePart(i);
      }
    }

    // artBoardDraw.setStrokeColor(sketch.random(255), sketch.random(255), sketch.random(255));
  }
  function moveForward(steps: number, direction: string) {
    for (let i = 0; i < steps; i++) {
      moveForwardPart(i, direction);
    }
  }

  /** Function called in makeArc to arc the arc in n small steps */
  function makeArcSteps(i: number, radius: number) {
    // timer = setTimeout(() => {
    let initialX = turtle.getTurtleX();
    let initialY = turtle.getTurtleY();

    let finalX = initialX + radius * sketch.cos(turtle.getTurtleAngle() + 1);
    let finalY = initialY - radius * sketch.sin(turtle.getTurtleAngle() + 1);

    sketch.line(initialX, initialY, finalX, finalY);

    turtle.setTurtleX(finalX);
    turtle.setTurtleY(finalY);

    turtle.setTurleAngle(turtle.getTurtleAngle() + 1);
    // }, 50 * i);
    // timerRunning = true;
    // functionality
  }

  const sleep = (milliseconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };
  /**
   *
   * @param radius Radius for the arc
   * @param angle The angle of the arc
   */
  async function makeArc(angle: number, radius: number) {
    for (let i = 0; i < angle; i++) {
      await sleep(50);
      makeArcSteps(i, radius);
    }
  }

  function rotate() {
    rotateTurtle(30);
  }
  function move() {
    moveForward(20, 'forward');
  }
  function moveInArc() {
    makeArc(90, 5);
  }

  sketch.setup = () => {
    const [width, height]: [number, number] = getViewportDimensions();
    sketch.createCanvas(width, height);
    sketch.background(230);
    moveForwardButton = sketch.createButton('Move');
    moveForwardButton.mousePressed(move);
    moveForwardButton.position(300, 0);
    rotateButton = sketch.createButton('Rotate');
    rotateButton.mousePressed(rotate);
    rotateButton.position(300, 30);
    moveInArcButton = sketch.createButton('Arc');
    moveInArcButton.mousePressed(moveInArc);
    moveInArcButton.position(400, 30);
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
