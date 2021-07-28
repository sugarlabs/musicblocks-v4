import { useState } from 'react';

// -- model component ------------------------------------------------------------------------------

// -- utilities ------------------------------------------------------------------------------------

import { getViewportDimensions } from '../../utils/ambience';

// -- view component -------------------------------------------------------------------------------

import Artboard from '../../views/artboard/Artboard';

// -- view-model component definition --------------------------------------------------------------

/**
 * ViewModel of the Artboard Framework component.
 */
export default function (props: any): JSX.Element {
    const turtleCount = props.turtleCount;
    const moveToTop = props.moveToTop;
    const turtles = props.turtles;
    const boards = props.boards;
    const [dimensions, setDimensions] = useState(getViewportDimensions());
    const updateDimensions = () => setDimensions(getViewportDimensions());

    return Artboard({ turtleCount, boards, turtles, dimensions, updateDimensions, moveToTop });
}
