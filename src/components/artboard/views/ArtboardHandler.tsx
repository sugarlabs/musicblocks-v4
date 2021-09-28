import { useEffect, useState } from 'react';
// -- types ----------------------------------------------------------------------------------------

import { IArtboardHandlerProps } from '@/@types/artboard';

// -- stylesheet -----------------------------------------------------------------------------------

import './Artboard.scss';

// -- view component definition --------------------------------------------------------------------

import { ArtboardSketch } from './ArtboardSketch';
/**
 * Passes the props with their function to call each turtle to move or rotate.
 *
 * @returns root JSX element
 */
export default function (props: IArtboardHandlerProps): JSX.Element {
  const [doMove, setDoMove] = useState<boolean>(false);
  const [doRotate, setDoRotation] = useState<boolean>(false);
  const [doMakeArc, setDoMakeArc] = useState<boolean>(false);
  const [doCleanAll, setDoCleanAll] = useState<boolean>(false);

  function handleArc() {
    setDoMakeArc(!doMakeArc);
    props.setDoArc(false);
  }

  function handleClean() {
    setDoCleanAll(!doCleanAll);
    props.setDoClean(false);
  }

  function handleMove() {
    setDoMove(!doMove);
    props.setDoMove(false);
  }
  function handleRotate() {
    setDoRotation(!doRotate);
    props.setDoRotate(false);
  }
  useEffect(() => {
    window.addEventListener('resize', props.updateDimensions);
    return () => window.removeEventListener('resize', props.updateDimensions);
  }, []);

  useEffect(() => {
    if (props.doArc && props.index == props.selectedTurtle) {
      handleArc();
    }
    if (props.doClean) {
      handleClean();
    }
  }, [props.doArc, props.doClean]);

  useEffect(() => {
    if (props.doMove && props.index == props.selectedTurtle) {
      handleMove();
    }
  }, [props.doMove]);
  useEffect(() => {
    if (props.doRotate && props.index == props.selectedTurtle) {
      handleRotate();
    }
  }, [props.doRotate]);

  return (
    <>
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
        cleanAll={doCleanAll}
        handleClean={handleClean}
        turtleSettings={props.turtleSettings}
      />
    </>
  );
}
