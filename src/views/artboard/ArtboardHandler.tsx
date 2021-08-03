import { useEffect, useState } from 'react';
// -- types ----------------------------------------------------------------------------------------

import { IArtboardHandlerProps } from '../../@types/artboard';

// -- stylesheet -----------------------------------------------------------------------------------

import './Artboard.scss';

// -- view component definition --------------------------------------------------------------------

import { ArtboardSketch, boardSketch } from './ArtboardSketch';
/**
 * View of the Artboard Framework component.
 *
 * @returns root JSX element
 */
export default function (props: IArtboardHandlerProps): JSX.Element {
  const [doMove, setDoMove] = useState<boolean>(false);
  const [doRotate, setDoRotation] = useState<boolean>(false);
  const [doMakeArc, setDoMakeArc] = useState<boolean>(false);
  // const [turtleColor, setTurtleColor] = useState<string>();
  // const colors = ['red', 'magenta', 'pink', 'orange', 'green', 'blue'];

  const handleMove = () => setDoMove(!doMove);
  const handleRotate = () => setDoRotation(!doRotate);
  const handleArc = () => setDoMakeArc(!doMakeArc);
  useEffect(() => {
    window.addEventListener('resize', props.updateDimensions);
    return () => window.removeEventListener('resize', props.updateDimensions);
  }, []);

  return (
    <>
      {/* <button onClick={handleArc}>Arc</button> */}
      <button onClick={handleArc}>Move</button>
      <ArtboardSketch
        index={props.index}
        sketch={boardSketch}
        turtle={props.turtle}
        doMove={doMove}
        handleMove={handleMove}
        rotation={doRotate}
        handleRotation={handleRotate}
        makeArc={doMakeArc}
        handleArc={handleArc}
        sleepTime={20}
      />
    </>
  );
}
