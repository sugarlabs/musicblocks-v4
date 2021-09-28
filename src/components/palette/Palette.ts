import { useEffect, useState } from 'react';

// -- other component ------------------------------------------------------------------------------

import monitor from '../monitor/Monitor';

// -- model component ------------------------------------------------------------------------------

import _PaletteModel from '../../models/palette/Palette';
const PaletteModel = new _PaletteModel();

// -- view component -------------------------------------------------------------------------------

import Palette from '../../views/palette/Palette';

// -- view-model component definition --------------------------------------------------------------

/**
 * ViewModel of the Palette component.
 */
export default function (): JSX.Element {
    const [sections, setSections] = useState<string[]>([]);
    const [subSections, setSubSections] = useState<string[]>([]);
    const [selectedSection, setSelectedSection] = useState<number>(0);
    const [hideSubSection, setHideSubSection] = useState<boolean>(true);
    const [openedSection, setOpenedSection] = useState<number>(-1);

    useEffect(() => {
        // (async () => setSections(await monitor.palette.getSections()))();
        (async () => {
            setSections((await monitor.palette.getMethodResult('fetchSections')) as string[]);
        })();
    }, []);

    useEffect(() => {
        // (async () => setSubSections(await monitor.palette.getSubSection(selectedSection)))();
        (async () => {
            setSubSections(
                (await monitor.palette.getMethodResult(
                    'fetchSubSections',
                    selectedSection,
                )) as string[],
            );
        })();
    }, [selectedSection]);

    const toggleHideSubSection = (flag: boolean) => {
        PaletteModel.toggleHideSubSection(flag);
        setHideSubSection(PaletteModel.hideSubSection);
    };

    const changeSelectedSection = (index: number) => {
        if (openedSection === index) {
            toggleHideSubSection(true);
            /** Here -1 shows that no subSection is opened */
            setOpenedSection(-1);
        } else {
            PaletteModel.changeSelectedSection(index);
            setSelectedSection(PaletteModel.selectedSection);
            setOpenedSection(PaletteModel.selectedSection);
            toggleHideSubSection(false);
        }
    };

    // -- render -----------------------------------------------------------------------------------

    return Palette({
        sections,
        subSections,
        hideSubSection,
        selectedSection,
        changeSelectedSection,
        openedSection,
    });
}
