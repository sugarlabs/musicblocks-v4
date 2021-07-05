// -- monitor component ----------------------------------------------------------------------------

import Monitor from '../Monitor';
// -- type -----------------------------------------------------------------------------------------
import { IBlockPopUp } from '../../@types/palette';
// -- view component -------------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import PopUp from '../../views/palette/PopUp';

// -- view-model component definition --------------------------------------------------------------

/**
 * ViewModel of the PopUp component.
 */
export default function (props: IBlockPopUp): JSX.Element {
    const [selectedHighShelf, setSelectedHighShelf] = useState<string>('');
    const [openLowShelf, setOpenLowShelf] = useState<boolean>(false);
    const openAccordion = (highShelf: string) => {
        if (selectedHighShelf === highShelf) {
            setSelectedHighShelf('');
        } else {
            setOpenLowShelf(true);
            setSelectedHighShelf(highShelf);
        }
    };
    let subSectionName = props.subSectionName;
    const [blockList, setBlockList] = useState<(string | { [button: string]: string[] })[]>([]);
    useEffect(() => {
        (async () => setBlockList(await Monitor.palette.getBlockList(subSectionName)))();
    }, [props.subSectionName]);

    return PopUp({
        subSectionName,
        blockList,
        selectedHighShelf,
        openLowShelf,
        openAccordion,
    });
}
