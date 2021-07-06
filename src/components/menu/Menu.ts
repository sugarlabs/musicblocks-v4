import { useEffect, useState } from 'react';

import Monitor from '../Monitor';

// -- model component ------------------------------------------------------------------------------

import _MenuModel from '../../models/menu/Menu';
const MenuModel = new _MenuModel();

// -- view component -------------------------------------------------------------------------------

import MenuView from '../../views/menu/Menu';

// -- view-model component definition --------------------------------------------------------------

/**
 * ViewModel of the Menu component.
 */
export default function (): JSX.Element {
    const [autoHide, setAutoHide] = useState<boolean>(true);
    const [autoHideTemp, setAutoHideTemp] = useState<boolean>(true);
    const [playMenuVisible, setPlayMenuVisible] = useState<boolean>(false);
    const [settingsMenuVisible, setSettingsMenuVisible] = useState<boolean>(false);
    const [projectMenuVisible, setProjectMenuVisible] = useState<boolean>(false);
    const [languageMenuVisible, setLanguageMenuVisible] = useState<boolean>(false);
    const [languages, setLanguages] = useState<string[]>([]);

    // fetch the languages from Monitor in initial render
    useEffect(() => {
        (async () => setLanguages(await Monitor.menu.getLanguages()))();
    }, []);

    const toggleAutoHideTemp = () => {
        MenuModel.toggleAutoHideTemp();
        setAutoHideTemp(MenuModel.autoHideTemp);
    };

    const togglePlayMenu = () => {
        MenuModel.togglePlayMenu();
        setPlayMenuVisible(MenuModel.playMenuVisible);
    };

    const toggleSettingsMenu = () => {
        MenuModel.toggleSettingsMenu();
        setSettingsMenuVisible(MenuModel.settingsMenuVisible);
    };

    const toggleProjectMenu = () => {
        MenuModel.toggleProjectMenu();
        setProjectMenuVisible(MenuModel.projectMenuVisible);
    };

    const toggleLanguageMenu = () => {
        MenuModel.toggleLanguageMenu();
        setLanguageMenuVisible(MenuModel.languageMenuVisible);
    };

    const toggleAutoHide = () => {
        MenuModel.toggleAutoHide();
        setAutoHide(MenuModel.autoHide);

        // closes any open submenu while auto-hiding the menu-dock
        if (!autoHide && autoHideTemp) {
            if (playMenuVisible) {
                togglePlayMenu();
            }
            if (settingsMenuVisible) {
                toggleSettingsMenu();
            }
            if (projectMenuVisible) {
                toggleProjectMenu();
            }
            if (languageMenuVisible) {
                toggleLanguageMenu();
            }
        }
    };

    const changeLanguage = (language: string) => {
        toggleLanguageMenu();
        Monitor.menu.changeLanguage(language);
    };

    return MenuView({
        autoHide,
        autoHideTemp,
        playMenuVisible,
        settingsMenuVisible,
        projectMenuVisible,
        languageMenuVisible,
        languages,
        changeLanguage,
        toggleAutoHide,
        toggleAutoHideTemp,
        togglePlayMenu,
        toggleSettingsMenu,
        toggleProjectMenu,
        toggleLanguageMenu,
    });
}
