// -- types ----------------------------------------------------------------------------------------

import { IArtboard, IArtboardManager } from '../../@types/monitor';

// -- other components -----------------------------------------------------------------------------

import { MonitorUtils } from '../MonitorUtils';
import { Monitor } from '../Monitor';

// -- utilities ------------------------------------------------------------------------------------

// -- subcomponent definition ----------------------------------------------------------------------

/**
 * Class representing the Artboard subcomponent proxied by the Monitor component.
 */
export class Artboard extends MonitorUtils implements IArtboard {
    protected monitor: Monitor;

    constructor(monitor: Monitor) {
        super();
        this.monitor = monitor;

        this.methodTable = {};
    }

    clean(): void {
        // clean the artwork on the artboard
    }
}

/**
 * Class representing the ArtboardManager subcomponent proxied by the Monitor component.
 */
export class ArtboardManager extends MonitorUtils implements IArtboardManager {
    protected monitor: Monitor;

    constructor(monitor: Monitor) {
        super();
        this.monitor = monitor;

        this.methodTable = {};
    }

    /** enable horizontal scrolling in the artboards*/
    enableHorizontalScroll(isEnabled: boolean): void {
        isEnabled;
    }

    enableTurtleWrap(isWrapOn: boolean): void {
        isWrapOn;
    }

    playArtboard(id: number): void {
        id;
    }

    stopArtboard(id: number): void {
        id;
    }

    removeArtboard(id: number): void {
        id;
    }

    addArtboard(id: number, x: number, y: number, angle: number): void {
        [id, x, y, angle];
    }
}
