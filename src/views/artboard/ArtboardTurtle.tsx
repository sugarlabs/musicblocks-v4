// -- types ----------------------------------------------------------------------------------------

import React from 'react';
import { P5WrapperTurtleProps } from '../../@types/artboard';
import { TurtleSetup } from './TurtleSetup';
// -- model component definition -------------------------------------------------------------------

/** This is a setup function.*/

/**
 * Class representing the Model of the Artboard component.
 */
// let artBoardList: IArtboardModel[];
export const ArtboardTurtleSketch: React.FC<P5WrapperTurtleProps> = ({ ...props }) => {
  /** Stores the value of the auto hide state. */

  return (
    <>
      <TurtleSetup turtle={props.turtle} />
    </>
  );
};
