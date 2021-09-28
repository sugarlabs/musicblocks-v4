import { useState } from 'react';

// -- utilities ------------------------------------------------------------------------------------

import { getViewportDimensions } from '@/utils/ambience';

// -- view component -------------------------------------------------------------------------------

import Artboard from './views/Artboard';

// -- view-model component definition --------------------------------------------------------------

/**
 * ViewModel of the Artboard Framework component.
 */
export default function (props: {
    moveToTop: (id: number) => void;
    activeBoards: number[];
}): JSX.Element {
    const [dimensions, setDimensions] = useState(getViewportDimensions());
    const updateDimensions = () => setDimensions(getViewportDimensions());

    return Artboard({
        dimensions,
        updateDimensions,
        moveToTop: props.moveToTop,
        activeBoards: (activeBoards: number[]) => activeBoards,
    });
}
