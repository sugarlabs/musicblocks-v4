import React, { useContext, useState } from 'react';
import { useEffect } from 'react';
import { ITurtleModel } from '../../@types/artboard';
import { ArtBoardContext } from '../../context/ArtBoardContext';
import TurtleSVG from './TurtleSVG';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const TurtleSetup = (props: { turtle: ITurtleModel }) => {
  const { artBoardList } = useContext(ArtBoardContext);

  const [interaction, setInteraction] = useState(false);
  const [position, setPosition] = React.useState({
    x: props.turtle.getTurtleX(),
    y: props.turtle.getTurtleY(),
    coords: { x: 0, y: 0 },
  });
  // console.log(props.x);
  // console.log(props.y);
  // Use useRef to create the function once and hold a reference to it.
  const handleMouseMove = React.useRef((e: MouseEvent) => {
    setInteraction(true);
    setPosition((position) => {
      const xDiff = position.coords.x - e.pageX;
      const yDiff = position.coords.y - e.pageY;
      props.turtle.setTurtleX(e.pageX);
      props.turtle.setTurtleY(e.pageY);
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
    setInteraction(true);
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

    setPosition((position) =>
      Object.assign({}, position, {
        coords: {},
      }),
    );
    setInteraction(false);
  };

  // useEffect(() => {
  //   setPosition((position) =>
  //     Object.assign({}, position, {
  //       coords: {},
  //     }),
  //   );
  // });
  return (
    <>
      {/* {artBoardList.map((board) => ( */}
      <TurtleSVG
        position={position}
        turtle={props.turtle}
        color={props.turtle.getColor()}
        handleMouseDown={handleMouseDown}
        handleMouseUp={handleMouseUp}
      />
    </>
  );
};
