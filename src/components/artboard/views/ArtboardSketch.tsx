// -- types ----------------------------------------------------------------------------------------

import p5 from 'p5';
import React, { useEffect, createRef, useState, useContext } from 'react';
import { getViewportDimensions } from '../../../utils/ambience';
import { P5Instance, SketchProps, P5WrapperProps } from '../../../@types/artboard';

// -- model component definition -------------------------------------------------------------------
import ArtBoardDraw from '../models/ArBoardDraw';
// let turtle: ITurtleModel;

// -- global configuration context definition -----------------------------------------------------------
import { ConfigContext } from '../../../context/config';

/** This is a setup function.*/

/**
 * Handles the main functionality of the artboard sketch.
 */
export const ArtboardSketch: React.FC<P5WrapperProps> = ({ children, ...props }) => {
  const { appConfig /*, setAppConfig*/ } = useContext(ConfigContext);
  const artBoardDraw = new ArtBoardDraw(props.turtle.getColor());
  const [currentTurtle, setcurrentTurtle] = useState(props.turtle);
  const [turtleSettings, setTurtleSettings] = useState(props.turtleSettings);
  const boardSketch = (sketch: P5Instance): void => {
    // The three buttons to control the turtle
    const steps = turtleSettings.steps;

    // controller variables used in Draw functions (controlled by manager)
    let doMoveForward = false;
    let doRotate = false;
    let doMakeArc = false;

    // checks whether the turtle is moving or not
    let isMoving = false;

    // method to clean the artwork of the turtle
    const clean = () => {
      sketch.clear();
    };

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
      currentTurtle.setIsMoving(true);
      for (let i = 0; i < angle; i++) {
        await sleep(turtleSettings.sleepTime);
        rotateTurtlePart(isNegative);
      }
      currentTurtle.setIsMoving(false);
    }

    /**
     * Rotates the turtle by the defined steps and in forward and back direction.
     * @param direction The direction in which the turtle move ( forward or back)
     * @param steps Number of steps the turtle move
     */
    async function moveForward(steps: number, direction: string) {
      currentTurtle.setIsMoving(true);
      for (let i = 0; i < steps; i++) {
        await sleep(turtleSettings.moveSleepTime);
        moveForwardPart(i, direction);
      }
      currentTurtle.setIsMoving(false);
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
      currentTurtle.setIsMoving(true);
      for (let i = 0; i < angle; i++) {
        // await sleep(50);
        await sleep(turtleSettings.moveSleepTime);
        makeArcSteps(i, radius);
      }
      isMoving = !isMoving;
      currentTurtle.setIsMoving(false);
    }

    function rotate() {
      rotateTurtle(turtleSettings.rotateAngle);
    }
    function move() {
      moveForward(turtleSettings.distance, turtleSettings.moveDirection);
    }
    function moveInArc() {
      isMoving = !isMoving;
      makeArc(turtleSettings.arcAngle, turtleSettings.arcRadius);
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
      let doClean = props.cleanAll;

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

      if (doClean && !isMoving) {
        clean();
        props.handleClean();
      }
    };

    sketch.draw = () => {
      const [width, height]: [number, number] = getViewportDimensions();
      sketch.stroke(artBoardDraw.getStokeColor());
      sketch.strokeWeight(artBoardDraw.getStrokeWeight());
      if (currentTurtle.getTurtleX() > width && appConfig.spriteWrap) {
        currentTurtle.setTurtleX(0);
      }
      if (currentTurtle.getTurtleX() < 0 && appConfig.spriteWrap) {
        currentTurtle.setTurtleX(width);
      }
      if (currentTurtle.getTurtleY() > height && appConfig.spriteWrap) {
        currentTurtle.setTurtleY(0);
      }
      if (currentTurtle.getTurtleY() < 0 && appConfig.spriteWrap) {
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
    setTurtleSettings(props.turtleSettings);
    if (artboardSketch.current === null) return;
    instance?.remove();
    const canvas = new p5(boardSketch, artboardSketch.current);
    setInstance(canvas);
  }, [props.turtle, appConfig.spriteWrap]);

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
