import { useEffect, useState } from 'react';
// -- types ----------------------------------------------------------------------------------------

import { IArtboardProps } from '../../@types/artboard';

// -- stylesheet -----------------------------------------------------------------------------------

import './Artboard.scss';

// -- view component definition --------------------------------------------------------------------

import { ArtboardSketch, boardSketch } from './ArtboardSketch';
import { ArtboardTurtleSketch, turtleSketch } from './ArtboardTurtle';
/**
 * View of the Artboard Framework component.
 *
 * @returns root JSX element
 */
export default function (props: IArtboardProps): JSX.Element {
  console.log('turtles', props.turtles);
  console.log('turtleCount', props.turtleCount);
  console.log('boards', props.boards);
  const [id, setId] = useState<number>(0);
  const [doMove, setDoMove] = useState<boolean>(false);
  const [doRotate, setDoRotation] = useState<boolean>(false);
  const [doMakeArc, setDoMakeArc] = useState<boolean>(false);
  const [turtleColor, setTurtleColor] = useState<string>();
  const colors = ['red', 'magenta', 'pink', 'orange', 'green', 'blue'];

  const handleMove = () => setDoMove(!doMove);
  const handleRotate = () => setDoRotation(!doRotate);
  const handleArc = () => setDoMakeArc(!doMakeArc);
  useEffect(() => {
    window.addEventListener('resize', props.updateDimensions);
    return () => window.removeEventListener('resize', props.updateDimensions);
  }, []);

  return (
    <>
      <div id="artboard-wrapper">
        <h4>Artboard {`(${props.dimensions[0]} × ${props.dimensions[1]})`}</h4>
        <ArtboardSketch
          sketch={boardSketch}
          index={id}
          doMove={doMove}
          handleMove={handleMove}
          rotation={doRotate}
          handleRotation={handleRotate}
          makeArc={doMakeArc}
          handleArc={handleArc}
          sleepTime={50}
        />
        <ArtboardTurtleSketch sketch={turtleSketch} index={id + 1} color={turtleColor} />
      </div>
    </>
  );
}
