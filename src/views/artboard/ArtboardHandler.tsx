import { useEffect, useState } from 'react';
// -- types ----------------------------------------------------------------------------------------

import { IArtboardHandlerProps } from '../../@types/artboard';

// -- stylesheet -----------------------------------------------------------------------------------

import './Artboard.scss';

// -- view component definition --------------------------------------------------------------------

import { ArtboardSketch } from './ArtboardSketch';
/**
 * View of the Artboard Framework component.
 *
 * @returns root JSX element
 */
export default function (props: IArtboardHandlerProps): JSX.Element {
  const [doMove, setDoMove] = useState<boolean>(false);
  const [doRotate, setDoRotation] = useState<boolean>(false);
  const [doMakeArc, setDoMakeArc] = useState<boolean>(false);
  const handleMove = () => setDoMove(!doMove);
  const handleRotate = () => setDoRotation(!doRotate);
  function handleArc() {
    setDoMakeArc(!doMakeArc);
    props.setDoArc(false);
  }
  useEffect(() => {
    window.addEventListener('resize', props.updateDimensions);
    return () => window.removeEventListener('resize', props.updateDimensions);
  }, []);
  useEffect(() => {
    if (props.doArc) {
      handleArc();
    }
  }, [props.doArc]);

  return (
    <>
      {/* <button onClick={handleArc}>{`Arc${props.index}`}</button> */}
      {/* <button onClick={handleMove}>{`Move${props.index}`}</button> */}
      {/* <button onClick={handleRotate}>{`Rotate${props.index}`}</button> */}
      <ArtboardSketch
        key={props.index}
        index={props.index}
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
