// -- types ----------------------------------------------------------------------------------------

import p5 from 'p5';
import React, { useEffect, createRef, useState } from 'react';
import { getViewportDimensions } from '../../utils/ambience';
import { P5Instance, SketchProps, P5WrapperProps } from '../../@types/artboard';

// -- model component definition -------------------------------------------------------------------
import ArtBoardDraw from '../../models/artboard/ArBoardDraw';
import { turtle } from '../../models/artboard/Turtle';
const artBoardDraw = new ArtBoardDraw();

/** This is a setup function.*/

export const boardSketch = (sketch: P5Instance): void => {
  // The three buttons to control the turtle
  let moveForwardButton: p5.Element;
  let rotateButton: p5.Element;
  let moveInArcButton: p5.Element;
  const steps = 5;

  // controller variables used in Draw functions (controlled by manager)
  let doMoveForward = false;
  let doRotate = false;
  let doMakeArc = false;
  let sleepTime: number;

  const sleep = (milliseconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };
  /**
   * Called by moveForward iteravively to move the turtle forward step by step.
   * @param direction In which direction to draw the line
   */
  function moveForwardPart(i: number, direction: string) {
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
  }
  /**
   * Called by moveForward iteravively to move the turtle forward step by step.
   * @param isNegative rotate the turtle in antiClockwise direction if isNegative is false
   * and vice versa
   */
  function rotateTurtlePart(isNegative: boolean) {
    const initialAngle = turtle.getTurtleAngle();
    if (isNegative) {
      turtle.setTurleAngle((initialAngle - 1) % 360);
    } else {
      turtle.setTurleAngle((initialAngle + 1) % 360);
    }
  }
  /**
   * Rotates the turtle by the defined angle.
   * @param angle Angle by which the turtle should be rotated
   */
  async function rotateTurtle(angle: number) {
    let isNegative = false;
    if (angle < 0) {
      isNegative = true;
      angle = angle * -1;
    }

    for (let i = 0; i < angle; i++) {
      await sleep(10);
      rotateTurtlePart(isNegative);
    }
  }

  /**
   * Rotates the turtle by the defined steps and in forward and back direction.
   * @param direction The direction in which the turtle move ( forward or back)
   * @param steps Number of steps the turtle move
   */
  async function moveForward(steps: number, direction: string) {
    for (let i = 0; i < steps; i++) {
      await sleep(50);
      moveForwardPart(i, direction);
    }
  }

  /**
   * Function called in makeArc to arc the arc in n small steps
   * */
  function makeArcSteps(i: number, radius: number) {
    let initialX = turtle.getTurtleX();
    let initialY = turtle.getTurtleY();

    let finalX = initialX + radius * sketch.cos(turtle.getTurtleAngle() + 1);
    let finalY = initialY - radius * sketch.sin(turtle.getTurtleAngle() + 1);

    sketch.line(initialX, initialY, finalX, finalY);

    turtle.setTurtleX(finalX);
    turtle.setTurtleY(finalY);

    turtle.setTurleAngle(turtle.getTurtleAngle() + 1);
  }

  /**
   *
   * @param radius Radius for the arc
   * @param angle The angle of the arc
   */
  async function makeArc(angle: number, radius: number) {
    for (let i = 0; i < angle; i++) {
      // await sleep(50);
      await sleep(sleepTime);
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

  sketch.updateWithProps = (props: SketchProps) => {
    if (props.doMove) {
      doMoveForward = props.doMove;
    }

    if (props.rotation) {
      doRotate = props.rotation;
    }

    if (props.makeArc) {
      doMakeArc = props.makeArc;
    }

    if (props.sleepTime) {
      sleepTime = props.sleepTime;
    }
  };

  sketch.draw = () => {
    if (doMoveForward) {
      move();
      doMoveForward = false;
    }

    if (doRotate) {
      rotate();
      doRotate = false;
    }

    if (doMakeArc) {
      moveInArc();
      doMakeArc = false;
    }

    sketch.stroke(artBoardDraw.getStokeColor());
    sketch.strokeWeight(artBoardDraw.getStrokeWeight());
  };
};

/**
 * Class representing the Model of the Artboard component.
 */
export const ArtboardSketch: React.FC<P5WrapperProps> = ({ sketch, children, ...props }) => {
  /** Stores the value of the auto hide state. */
  const artboardSketch = createRef<HTMLDivElement>();
  const [instance, setInstance] = useState<P5Instance>();
  const id = `art-board-${props.index}`;
  useEffect(() => {
    instance?.updateWithProps?.(props);
  }, [props]);

  useEffect(() => {
    if (artboardSketch.current === null) return;
    instance?.remove();
    const canvas = new p5(sketch, artboardSketch.current);
    setInstance(canvas);
  }, [sketch, artboardSketch.current]);

  return (
    <div id={id} ref={artboardSketch}>
      {children}
    </div>
  );
};
