import { useContext, useEffect, useState } from 'react';

// -- types ----------------------------------------------------------------------------------------

import { TAppLanguage } from '../../@types/config';

// -- other components -----------------------------------------------------------------------------

import Monitor from '../../monitor/Monitor';

// -- context --------------------------------------------------------------------------------------

import { ConfigContext } from '../../context/config';

// -- model component ------------------------------------------------------------------------------

import _MenuModel from './models/Menu';
const MenuModel = new _MenuModel();

// -- view component -------------------------------------------------------------------------------

import MenuView from './views/Menu';

// -- view-model component definition --------------------------------------------------------------

/**
 * ViewModel of the Menu component.
 */
export default function (): JSX.Element {
    useEffect(() => {
        (async () => {
            [MenuModel.languages, MenuModel.brickSizes] = await Promise.all([
                Monitor.menu.getMethodResult('fetchLanguages') as Promise<
                    {
                        code: TAppLanguage;
                        name: string;
                    }[]
                >,
                Monitor.menu.getMethodResult('fetchBrickSizes') as Promise<
                    {
                        value: number;
                        label: string;
                    }[]
                >,
            ]);
        })();
    }, []);

    const [value, setValue] = useState(false);
    const forceUpdate = () => setValue(!value);
    Monitor.menu.registerStateObject(
        MenuModel as unknown as { [key: string]: unknown },
        forceUpdate,
    );

    const { appConfig, projectConfig } = useContext(ConfigContext);

    // -- render -----------------------------------------------------------------------------------

    return MenuView({
        playing: MenuModel.playing,
        playHandler: () => Monitor.menu.doMethod('play'),
        playSlowHandler: () => Monitor.menu.doMethod('playSlowly'),
        playStepHandler: () => Monitor.menu.doMethod('playNextStep'),
        stopHandler: () => Monitor.menu.doMethod('stop'),
        undoHandler: () => Monitor.menu.doMethod('undo'),
        redoHandler: () => Monitor.menu.doMethod('redo'),
        clearHandler: () => Monitor.menu.doMethod('clearArtboards'),
        setBrickVisibility: (visible: boolean) =>
            visible ? Monitor.menu.doMethod('showBricks') : Monitor.menu.doMethod('hideBricks'),
        setBrickFold: (fold: boolean) =>
            fold ? Monitor.menu.doMethod('foldBricks') : Monitor.menu.doMethod('unfoldBricks'),
        projectNewHandler: () => Monitor.menu.doMethod('projectNew'),
        projectLoadHandler: () => Monitor.menu.doMethod('projectLoad'),
        projectSavehandler: () => Monitor.menu.doMethod('projectSave'),
        masterVolumeRange: projectConfig.masterVolumeRange,
        masterVolume: projectConfig.masterVolume,
        setMasterVolume: (masterVolume: number) =>
            Monitor.menu.doMethod('setMasterVolume', masterVolume),
        brickSizeRange: appConfig.brickSizeRange,
        brickSize: appConfig.brickSize,
        setBrickSize: (brickSize: number) => Monitor.menu.doMethod('setBrickSize', brickSize),
        autoHide: appConfig.menuAutoHide,
        setAutoHide: (autoHide: boolean) => Monitor.menu.doMethod('setMenuAutoHide', autoHide),
        horizontalScroll: appConfig.horizontalScroll,
        setHorizontalScroll: (horizontalScroll: boolean) =>
            Monitor.menu.doMethod('setHorizontalScroll', horizontalScroll),
        spriteWrap: appConfig.spriteWrap,
        setSpriteWrap: (wrap: boolean) => Monitor.menu.doMethod('setSpriteWrap', wrap),
    });
}
