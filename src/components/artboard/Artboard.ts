import { useEffect, useState } from 'react';

// -- model component ------------------------------------------------------------------------------

import _ArtboardModel from '../../models/artboard/Artboard';
const ArtboardModel = new _ArtboardModel(0, 300, 300, 0);
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
    const [id, setId] = useState(0);
    const [x, setX] = useState<number>(200);
    const [y, setY] = useState<number>(200);
    const [angle, setAngle] = useState<number>(0);
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
        setX(props.board._x);
        setY(props.board._y);
        setAngle(props.board._angle);
    }, []);
    return Artboard({ id, x, y, angle, dimensions, updateDimensions, addLine, moveToTop });
}
