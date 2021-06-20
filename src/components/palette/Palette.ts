// -- monitor component ----------------------------------------------------------------------------

import Monitor from '../Monitor';

// -- view component -------------------------------------------------------------------------------

import Palette from '../../views/palette/Palette';
import { useEffect, useState } from 'react';

// -- view-model component definition --------------------------------------------------------------

/**
 * ViewModel of the Palette component.
 */
export default function (): JSX.Element {
    const [sections, setSections] = useState<string[]>([]);
    useEffect(() => {
        (async () => setSections(await Monitor.palette.getSections()))();
    }, []);

    return Palette({ sections });
}
