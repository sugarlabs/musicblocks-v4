// -- types ----------------------------------------------------------------------------------------

// -- other components -----------------------------------------------------------------------------

import { MonitorUtils } from '../MonitorUtils';
import { Monitor } from '../Monitor';

// -- utilities ------------------------------------------------------------------------------------

import { getBlockList, getSections, getSubSection } from '../../utils/config';

// -- subcomponent definition ----------------------------------------------------------------------

/**
 * Class representing the Menu subcomponent proxied by the Monitor component.
 */
export default class Palette extends MonitorUtils {
    protected monitor: Monitor;

    constructor(monitor: Monitor) {
        super();
        this.monitor = monitor;

        this.methodTable = {
            fetchSections: this._fetchSections,
            fetchSubSection: this._fetchSubSection,
            fetchBlockList: this._fetchBlockList,
        };
    }

    // -- Getters for values to present ----------------------------------------

    /** Returns a Promise for the list of palette sections. */
    private _fetchSections(): Promise<string[]> {
        return getSections();
    }

    private _fetchSubSection(index: number): Promise<string[]> {
        return getSubSection(index);
    }

    private _fetchBlockList(
        subSection: string,
    ): Promise<(string | { [button: string]: string[] })[]> {
        return getBlockList(subSection);
    }
}
