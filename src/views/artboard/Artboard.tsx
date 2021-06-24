import { useEffect, useRef } from 'react';
// -- types ----------------------------------------------------------------------------------------

import { IArtboardProps } from '../../@types/artboard';

// -- stylesheet -----------------------------------------------------------------------------------

import './Artboard.scss';

// -- view component definition --------------------------------------------------------------------
import ITurtleModel from '../../models/artboard/Turtle';
/**
 * View of the Artboard Framework component.
 *
 * @returns root JSX element
 */
export default function (props: IArtboardProps): JSX.Element {
  // const [canvases, setCanvases] = useState([]);
  // useEffect(() => {
  //   window.addEventListener('resize', props.updateDimensions);
  //   return () => window.removeEventListener('resize', props.updateDimensions);
  // }, []);

  return (
    <>
      <div id="artboard-wrapper">
        <h4>Artboard {`(${props.dimensions[0]} × ${props.dimensions[1]})`}</h4>
        <ITurtleModel />
      </div>
    </>
  );
}
