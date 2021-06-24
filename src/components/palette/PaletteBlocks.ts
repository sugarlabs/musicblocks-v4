// -- monitor component ----------------------------------------------------------------------------

import Monitor from '../Monitor';

// -- view component -------------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import PopUp from '../../views/palette/PopUp';
import { IBlockPopUp } from '../../@types/palette';

// -- view-model component definition --------------------------------------------------------------

/**
 * ViewModel of the PopUp component.
 */
export default function (props: IBlockPopUp): JSX.Element {
    let subSectionName = props.subSectionName;
    const [blockList, setBlockList] = useState<string[]>([]);
    useEffect(() => {
        (async () => setBlockList(await Monitor.palette.getBlockList(subSectionName)))();
    }, [props.subSectionName]);

    return PopUp({
        subSectionName,
        blockList,
    });
}
