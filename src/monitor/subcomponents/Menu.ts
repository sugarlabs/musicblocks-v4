// -- types ----------------------------------------------------------------------------------------

import { TAppLanguage } from '@/@types/config';

// -- other components -----------------------------------------------------------------------------

import { SignalUtils } from '../SignalUtils';
import { Monitor } from '../Monitor';

// -- utilities ------------------------------------------------------------------------------------

import { collectAppLanguages, collectBrickSizes } from '@/utils/config';

// -- subcomponent definition ----------------------------------------------------------------------

/**
 * Class representing the Menu subcomponent proxied by the Monitor component.
 */
export default class Menu extends SignalUtils {
    protected monitor: Monitor;

    constructor(monitor: Monitor) {
        super();
        this.monitor = monitor;

        this.methodTable = {
            /* The following are registered in App component */

            // setTheme,
            // setLanguage,
            // setMenuAutoHide,
            // setHorizontalScroll,
            // setSpriteWrap,
            // setBrickSize,
            // setMasterVolume,

            fetchLanguages: this._fetchLanguages,
            fetchBrickSizes: this._fetchBrickSizes,
            play: this._play,
            playSlowly: this._playSlowly,
            playNextStep: this._playNextStep,
            stop: this._stop,
            undo: this._undo,
            redo: this._redo,
            clearArtboards: this._clearArtboards,
            hideBricks: this._hideBricks,
            showBricks: this._showBricks,
            foldBricks: this._foldBricks,
            unfoldBricks: this._unfoldBricks,
            projectNew: this._newProject,
            projectLoad: this._loadProject,
            projectSave: this._saveProject,
        };
    }

    // -- Getters for values to present ----------------------------------------

    /** Returns a Promise for a list of language code and corresponding names */
    private _fetchLanguages(): Promise<{ code: TAppLanguage; name: string }[]> {
        return collectAppLanguages();
    }

    /** Returns a Promise for a list of brick sizes and corresponding labels */
    private _fetchBrickSizes(): Promise<{ value: number; label: string }[]> {
        return collectBrickSizes();
    }

    // -- Actions --------------------------------------------------------------

    /** Runs the project in normal speed */
    private _play(): void {
        console.log('play');
        this.setState('playing', true);
        this.temporaryStore['play timer'] = setTimeout(() => this.setState('playing', false), 2500);
    }

    /** Runs the project at a lowered speed */
    private _playSlowly(): void {
        console.log('play slowly');
    }

    /** Runs the project one instruction at a time */
    private _playNextStep(): void {
        console.log('play next step');
    }

    /** Stops running the project */
    private _stop(): void {
        console.log('stop');
        if ('play timer' in this.temporaryStore) {
            clearTimeout(this.temporaryStore['play timer'] as NodeJS.Timeout);
            delete this.temporaryStore['play timer'];
            this.setState('playing', false);
        }
    }

    /** Undo last action */
    private _undo(): void {
        console.log('undo');
        (async () => {
            console.log(await this.getMethodResult('getState', 'playin'));
        })();
    }

    /** Redo last action */
    private _redo(): void {
        console.log('redo');
    }

    /** Clears the artboards */
    private _clearArtboards(): void {
        console.log('clear artboards');
    }

    /** Hides all the project builder bricks */
    private _hideBricks(): void {
        console.log('hide bricks');
    }

    /** Shows all the project builder bricks */
    private _showBricks(): void {
        console.log('show bricks');
    }

    /** Folds all project builder clamp bricks */
    private _foldBricks(): void {
        console.log('fold clamps');
    }

    /** Unfolds all project builder clamp bricks */
    private _unfoldBricks(): void {
        console.log('unfold clamps');
    }

    /** Creates a new project */
    private _newProject(): void {
        console.log('new project');
    }

    /** Loads an existing project */
    private _loadProject(): void {
        console.log('load project');
    }

    /** Saves the current project */
    private _saveProject(): void {
        console.log('save project');
    }
}
