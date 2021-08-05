// -- types ----------------------------------------------------------------------------------------

import p5 from 'p5';
import React, { useEffect, createRef, useState } from 'react';
import { getViewportDimensions } from '../../utils/ambience';
import { P5Instance, SketchProps, P5WrapperProps } from '../../@types/artboard';

// -- model component definition -------------------------------------------------------------------
import ArtBoardDraw from '../../models/artboard/ArBoardDraw';
// let turtle: ITurtleModel;

/** This is a setup function.*/

/**
 * Class representing the Model of the Artboard component.
 */
export const ArtboardSketch: React.FC<P5WrapperProps> = ({ children, ...props }) => {
  const artBoardDraw = new ArtBoardDraw();
  const [currentTurtle, setcurrentTurtle] = useState(props.turtle);
  const boardSketch = (sketch: P5Instance): void => {
    // The three buttons to control the turtle
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
      const initialX = currentTurtle.getTurtleX();
      const initialY = currentTurtle.getTurtleY();

      if (direction === 'forward') {
        const finalX = initialX + steps * sketch.cos(currentTurtle.getTurtleAngle());
        const finalY = initialY - steps * sketch.sin(currentTurtle.getTurtleAngle());

        sketch.line(initialX, initialY, finalX, finalY);

        currentTurtle.setTurtleX(finalX);
        currentTurtle.setTurtleY(finalY);
      }
      if (direction === 'back') {
        const finalX = initialX - steps * sketch.cos(currentTurtle.getTurtleAngle());
        const finalY = initialY + steps * sketch.sin(currentTurtle.getTurtleAngle());

        sketch.line(initialX, initialY, finalX, finalY);

        currentTurtle.setTurtleX(finalX);
        currentTurtle.setTurtleY(finalY);
      }
    }
    /**
     * Called by moveForward iteravively to move the turtle forward step by step.
     * @param isNegative rotate the turtle in antiClockwise direction if isNegative is false
     * and vice versa
     */
    function rotateTurtlePart(isNegative: boolean) {
      const initialAngle = currentTurtle.getTurtleAngle();
      if (isNegative) {
        currentTurtle.setTurleAngle((initialAngle - 1) % 360);
      } else {
        currentTurtle.setTurleAngle((initialAngle + 1) % 360);
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
      let initialX = currentTurtle.getTurtleX();
      let initialY = currentTurtle.getTurtleY();

      let finalX = initialX + radius * sketch.cos(currentTurtle.getTurtleAngle() + 1);
      let finalY = initialY - radius * sketch.sin(currentTurtle.getTurtleAngle() + 1);

      sketch.line(initialX, initialY, finalX, finalY);

      currentTurtle.setTurtleX(finalX);
      currentTurtle.setTurtleY(finalY);

      currentTurtle.setTurleAngle(currentTurtle.getTurtleAngle() + 1);
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
      moveForward(50, 'forward');
    }
    function moveInArc() {
      makeArc(sketch.random(90, 360), sketch.random(0, 7));
    }

    sketch.setup = () => {
      const [width, height]: [number, number] = getViewportDimensions();
      sketch.createCanvas(width, height);
      sketch.clear();
      sketch.angleMode(sketch.DEGREES);
    };

    sketch.updateWithProps = (props: SketchProps) => {
      doMoveForward = props.doMove;
      doRotate = props.rotation;
      doMakeArc = props.makeArc;
      sleepTime = props.sleepTime;

      if (doMoveForward) {
        move();
        props.handleMove();
      }

      if (doRotate) {
        rotate();
        props.handleRotation();
      }

      if (doMakeArc) {
        moveInArc();
        props.handleArc();
      }
    };

    sketch.draw = () => {
      const [width, height]: [number, number] = getViewportDimensions();
      sketch.stroke(artBoardDraw.getStokeColor());
      sketch.strokeWeight(artBoardDraw.getStrokeWeight());
      if (currentTurtle.getTurtleX() > width) {
        currentTurtle.setTurtleX(0);
      }
      if (currentTurtle.getTurtleX() < 0) {
        currentTurtle.setTurtleX(width);
      }
      if (currentTurtle.getTurtleY() > height) {
        currentTurtle.setTurtleY(0);
      }
      if (currentTurtle.getTurtleY() < 0) {
        currentTurtle.setTurtleY(height);
      }
    };
  };
  /** Stores the value of the auto hide state. */
  const artboardSketch = createRef<HTMLDivElement>();
  const [instance, setInstance] = useState<P5Instance>();

  const id = `art-board-sketch-${props.index}`;
  useEffect(() => {
    instance?.updateWithProps?.(props);
  }, [props]);

  useEffect(() => {
    setcurrentTurtle(props.turtle);
    // currentTurtle = currentTurtle;
    if (artboardSketch.current === null) return;
    instance?.remove();
    const canvas = new p5(boardSketch, artboardSketch.current);
    setInstance(canvas);
  }, [props.turtle]);

  return (
    <div
      id={id}
      key={id}
      className="art-board-sketch"
      ref={artboardSketch}
      style={{ position: 'absolute' }}
    >
      {children}
    </div>
  );
};
