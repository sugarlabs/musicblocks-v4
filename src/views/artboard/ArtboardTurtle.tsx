// -- types ----------------------------------------------------------------------------------------

import React, { useEffect } from 'react';
import { P5WrapperTurtleProps, IArtboardModel } from '../../@types/artboard';
import { getViewportDimensions } from '../../utils/ambience';
import TurtleSVG from './TurtleSVG';
// -- model component definition -------------------------------------------------------------------

/** This is a setup function.*/
let artBoardList: IArtboardModel[];
const Turtle = () => {
  const [position, setPosition] = React.useState({
    x: 500,
    y: 500,
    coords: { x: 50, y: 50 },
  });

  // Use useRef to create the function once and hold a reference to it.
  const handleMouseMove = React.useRef((e: MouseEvent) => {
    setPosition((position) => {
      const xDiff = position.coords.x - e.pageX;
      const yDiff = position.coords.y - e.pageY;
      return {
        x: position.x - xDiff,
        y: position.y - yDiff,
        coords: {
          x: e.pageX,
          y: e.pageY,
        },
      };
    });
  });

  const handleMouseDown = (e: { pageX: any; pageY: any }) => {
    // Save the values of pageX and pageY and use it within setPosition.
    const pageX = e.pageX;
    const pageY = e.pageY;
    setPosition((position) =>
      Object.assign({}, position, {
        coords: {
          x: pageX,
          y: pageY,
        },
      }),
    );
    document.addEventListener('mousemove', handleMouseMove.current);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove.current);
    // Use Object.assign to do a shallow merge so as not to
    // totally overwrite the other values in state.
    setPosition((position) =>
      Object.assign({}, position, {
        coords: {},
      }),
    );
  };

  return (
    <TurtleSVG
      position={position}
      handleMouseDown={handleMouseDown}
      handleMouseUp={handleMouseUp}
    />
  );
};

/**
 * Class representing the Model of the Artboard component.
 */
export const ArtboardTurtleSketch: React.FC<P5WrapperTurtleProps> = ({ ...props }) => {
  const [width, height]: [number, number] = getViewportDimensions();
  /** Stores the value of the auto hide state. */
  const id = `art-board-turtle-${props.index}`;

  useEffect(() => {
    artBoardList = props.artBoardList;
  }, [props.artBoardList]);

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        border: '1px solid green',
        height: height,
        width: width,
        fill: 'red',
        zIndex: 1,
      }}
    >
      <Turtle />
      <Turtle />
      <Turtle />
    </svg>
  );
};
