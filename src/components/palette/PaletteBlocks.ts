import { useEffect, useState } from 'react';

// -- types ----------------------------------------------------------------------------------------

import { IBlockPopUp } from '../../@types/palette';

// -- other components -----------------------------------------------------------------------------

import monitor from '../monitor/Monitor';

// -- view component -------------------------------------------------------------------------------

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
        // (async () => setBlockList(await Monitor.palette.getBlockList(subSectionName)))();
        (async () => {
            setBlockList(
                (await monitor.palette.getMethodResult('fetchBlockList', subSectionName)) as (
                    | string
                    | { [button: string]: string[] }
                )[],
            );
        })();
    }, [props.subSectionName]);

    return PopUp({
        subSectionName,
        blockList,
        selectedHighShelf,
        openLowShelf,
        openAccordion,
    });
}
