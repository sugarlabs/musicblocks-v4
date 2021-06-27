import { useState } from 'react';

// -- model component ------------------------------------------------------------------------------

import _ArtboardModel from '../../models/artboard/Artboard';
const ArtboardModel = new _ArtboardModel();
// -- utilities ------------------------------------------------------------------------------------

import { getViewportDimensions } from '../../utils/ambience';

// -- view component -------------------------------------------------------------------------------

import Artboard from '../../views/artboard/Artboard';

// -- view-model component definition --------------------------------------------------------------

/**
 * ViewModel of the Artboard Framework component.
 */
export default function (): JSX.Element {
    const [dimensions, setDimensions] = useState(getViewportDimensions());
    const updateDimensions = () => setDimensions(getViewportDimensions());

    const [lines, setLines] = useState([]);
    const [arcs, setArcs] = useState([]);
    const addLine = (line: number) => {
        ArtboardModel.addLine(line);
    };

    return Artboard({ dimensions, updateDimensions, addLine });
}
