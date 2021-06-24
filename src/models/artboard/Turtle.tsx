// -- types ----------------------------------------------------------------------------------------

import p5 from 'p5';
import { useEffect, useRef } from 'react';
// import { ITurtleModel } from '../../@types/artboard';
import { sketch } from './ArtBoardSketch';

// -- model component definition -------------------------------------------------------------------

/**
 * Class representing the Model of the Artboard component.
 */
export default function ITurtleModel(): JSX.Element {
  /** Stores the value of the auto hide state. */

  const canvasRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  useEffect(() => {
    const newp5 = new p5(sketch, canvasRef.current);
  }, []);

  useEffect(() => {
    canvasRef.current.textContent = 'Hi';
    canvasRef.current.onmouseup = () => {
      canvasRef.current.textContent = 'Hi';
    };
  });
  useEffect(() => {
    canvasRef.current.textContent = 'Hi';
    canvasRef.current.onmousedown = () => {
      canvasRef.current.textContent = 'Click';
    };
  });

  return <div ref={canvasRef} />;
}
