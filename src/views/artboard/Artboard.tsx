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
  const [id, setId] = useState<number>(0);
  const [doMove, setDoMove] = useState<boolean>();
  const [doRotate, setDoRotation] = useState<boolean>();
  const [doMakeArc, setDoMakeArc] = useState<boolean>();
  const [turtleColor, setTurtleColor] = useState<string>();
  const colors = ['red', 'magenta', 'pink', 'orange', 'green', 'blue'];

  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };
  const handleMove = () => setDoMove(!doMove);
  const handleRotate = () => setDoRotation(!doRotate);
  const handleArc = () => setDoMakeArc(!doMakeArc);
  const handleTurtleColor = () => setTurtleColor(getRandomColor());

  useEffect(() => {
    window.addEventListener('resize', props.updateDimensions);
    return () => window.removeEventListener('resize', props.updateDimensions);
  }, []);

  useEffect(() => {
    setId(props.id);
  }, [props]);
  return (
    <>
      <div id="artboard-wrapper">
        <h4>Artboard {`(${props.dimensions[0]} × ${props.dimensions[1]})`}</h4>
        {
          <button style={{ position: 'absolute', left: 215, zIndex: 1200000 }} onClick={handleMove}>
            Move
          </button>
        }
        {
          <button
            style={{ position: 'absolute', left: 135, zIndex: 1200000 }}
            onClick={handleRotate}
          >
            Rotate
          </button>
        }
        {
          <button
            style={{ position: 'absolute', left: 35, zIndex: 1200000 }}
            onClick={handleTurtleColor}
          >
            Change Color
          </button>
        }
        <ArtboardSketch
          sketch={boardSketch}
          index={id}
          doMove={doMove}
          rotation={doRotate}
          sleepTime={100}
        />
        <ArtboardTurtleSketch sketch={turtleSketch} index={id + 1} color={turtleColor} />
      </div>
    </>
  );
}
