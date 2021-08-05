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
    const moveToTop = props.moveToTop;
    const [dimensions, setDimensions] = useState(getViewportDimensions());
    const updateDimensions = () => setDimensions(getViewportDimensions());

    return Artboard({ dimensions, updateDimensions, moveToTop });
}
