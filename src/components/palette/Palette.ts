// -- monitor component ----------------------------------------------------------------------------

import Monitor from '../Monitor';

// -- model component ------------------------------------------------------------------------------

import _PaletteModel from '../../models/palette/Palette';
const PaletteModel = new _PaletteModel();

// -- view component -------------------------------------------------------------------------------

import { useEffect, useState } from 'react';
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
    const [openedSection, setOpenedSection] = useState<number>(0);
    useEffect(() => {
        (async () => setSections(await Monitor.palette.getSections()))();
    }, []);

    useEffect(() => {
        (async () => setSubSections(await Monitor.palette.getSubSection(selectedSection)))();
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
    return Palette({
        sections,
        subSections,
        hideSubSection,
        selectedSection,
        changeSelectedSection,
        toggleHideSubSection,
        openedSection,
    });
}
