// -- types ----------------------------------------------------------------------------------------

import p5 from 'p5';
import React, { useEffect, useState, createRef } from 'react';
import { P5Instance, P5WrapperTurtleProps, IArtboardModel } from '../../@types/artboard';
import { getViewportDimensions } from '../../utils/ambience';
// -- model component definition -------------------------------------------------------------------

/** This is a setup function.*/
let artBoardList: IArtboardModel[];
export const turtleSketch = (sketch: P5Instance): void => {
  sketch.setup = () => {
    const [width, height]: [number, number] = getViewportDimensions();
    sketch.createCanvas(width, height);
    sketch.rectMode(sketch.CENTER);
    sketch.clear();
    sketch.angleMode(sketch.DEGREES);
    // artBoardList.map((artboard) => artboard._turtle.callSVG(sketch));
  };

  sketch.draw = () => {
    sketch.clear();
    artBoardList.map((artboard) => artboard._turtle.render(sketch));
  };
  sketch.mousePressed = () => {
    if (artBoardList.length > 0) {
      for (let i = 0; i < artBoardList.length; i++) {
        let turtle = artBoardList[i]._turtle,
          distance = sketch.dist(sketch.mouseX, sketch.mouseY, turtle._turtleX, turtle._turtleY);
        if (distance < 30) {
          turtle._active = true;
          // turtle.color = '#f00';
        } else {
          turtle._active = false;
          // turtle.color = '#000';
        }
      }
    }
    // Prevent default functionality.
    return false;
  };

  // Run when the mouse/touch is dragging.
  sketch.mouseDragged = () => {
    if (artBoardList.length > 0) {
      for (let i = artBoardList.length - 1; i >= 0; i--) {
        let turtle = artBoardList[i]._turtle;
        if (turtle._active) {
          turtle._turtleX = sketch.mouseX;
          turtle._turtleY = sketch.mouseY;
          // circle.x = mouseX;
          // circle.y = mouseY;
          break;
        }
      }
    }
    // Prevent default functionality.
    return false;
  };
};

/**
 * Class representing the Model of the Artboard component.
 */
export const ArtboardTurtleSketch: React.FC<P5WrapperTurtleProps> = ({
  sketch,
  children,
  ...props
}) => {
  /** Stores the value of the auto hide state. */
  const artboardTurtleSketch = createRef<HTMLDivElement>();
  const id = `art-board-turtle`;
  const [instance, setInstance] = useState<P5Instance>();

  useEffect(() => {
    instance?.updateWithProps?.(props);
  }, [props]);
  useEffect(() => {
    artBoardList = props.artBoardList;
  }, [props.artBoardList]);
  useEffect(() => {
    if (artboardTurtleSketch.current === null) return;
    instance?.remove();

    const canvas = new p5(turtleSketch, artboardTurtleSketch.current);
    setInstance(canvas);
  }, [sketch, artboardTurtleSketch.current]);

  return (
    <div id={id} ref={artboardTurtleSketch} className="art-board-sketch-turtle">
      {children}
    </div>
  );
};
