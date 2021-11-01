import { useEffect } from 'react';

// -- types ----------------------------------------------------------------------------------------

import { TBrickList } from '@/@types/palette';

// -- hooks ----------------------------------------------------------------------------------------

import { useForceUpdate } from '@/hooks/components';

// -- other component ------------------------------------------------------------------------------

import monitor from '@/components/monitor/Monitor';

// -- model component ------------------------------------------------------------------------------

import _PaletteModel from './models/Palette';
const PaletteModel = new _PaletteModel();

// -- view component -------------------------------------------------------------------------------

import Palette from './views/Palette';

// -- view-model component definition --------------------------------------------------------------

/**
 * ViewModel of the Palette component.
 */
export default function (): JSX.Element {
    const forceUpdate = useForceUpdate();

    useEffect(() => {
        (async () => {
            PaletteModel.sections = (await monitor.palette.getMethodResult(
                'fetchSections',
            )) as string[];

            PaletteModel.subSections = (await monitor.palette.getMethodResult(
                'fetchSubSections',
            )) as {
                [key: string]: string[];
            };

            PaletteModel.brickList = (await monitor.palette.getMethodResult(
                'fetchBrickList',
            )) as TBrickList;

            forceUpdate();
        })();
    }, []);

    // -- render -----------------------------------------------------------------------------------

    return Palette({
        sections: PaletteModel.sections,
        subSections: PaletteModel.subSections,
        brickList: PaletteModel.brickList,
    });
}
