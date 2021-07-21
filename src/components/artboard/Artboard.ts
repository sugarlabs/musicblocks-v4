import { useEffect, useState } from 'react';

// -- model component ------------------------------------------------------------------------------

import _ArtboardModel from '../../models/artboard/Artboard';
const ArtboardModel = new _ArtboardModel(0);
// -- utilities ------------------------------------------------------------------------------------

import { getViewportDimensions } from '../../utils/ambience';

// -- view component -------------------------------------------------------------------------------

import Artboard from '../../views/artboard/Artboard';

// -- view-model component definition --------------------------------------------------------------

/**
 * ViewModel of the Artboard Framework component.
 */
export default function (props: any): JSX.Element {
    const [id, setId] = useState(0);
    const [dimensions, setDimensions] = useState(getViewportDimensions());
    const updateDimensions = () => setDimensions(getViewportDimensions());

    const [lines, setLines] = useState([] as number[]);
    const [arcs, setArcs] = useState([] as number[]);
    const addLine = (line: number) => {
        ArtboardModel.addLine(line);
        setLines(lines.concat(line));
    };

    useEffect(() => {
        setId(props.board._id);
    }, []);
    return Artboard({ id, dimensions, updateDimensions, addLine });
}
