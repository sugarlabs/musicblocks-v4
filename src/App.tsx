import { useState } from 'react';

// -- types ----------------------------------------------------------------------------------------

import { TAppLanguage, TAppTheme } from '@/@types/config';

// -- context --------------------------------------------------------------------------------------

import { appConfigDefaults, ConfigContext, projectConfigDefaults } from '@/context/config';
import { ArtBoardContext, ContextDefaultArtBoard } from '@/context/ArtBoardContext';

// -- other components -----------------------------------------------------------------------------

import monitor from '@/monitor/Monitor';
import Menu from '@/components/menu/Menu';
import Palette from '@/components/palette/Palette';
import Manager from '@/components/artboard/Manager';

// -- stylesheet -----------------------------------------------------------------------------------

import './App.scss';

// -- component definition -------------------------------------------------------------------------

export default function App(): JSX.Element {
  const [appConfig, setAppConfig] = useState(appConfigDefaults);
  const [projectConfig, setProjectConfig] = useState(projectConfigDefaults);

  /* App relies on the following properties being set here */

  // -- Setters for the global app configurations ----------------------------

  // Sets the app theme
  monitor.menu.registerMethod('setTheme', (theme: TAppTheme) => {
    setAppConfig({ ...appConfig, theme });
  });
  // Sets the app language
  monitor.menu.registerMethod('setLanguage', (language: TAppLanguage) => {
    setAppConfig({ ...appConfig, language });
  });
  // Sets menu auto-hide
  monitor.menu.registerMethod('setMenuAutoHide', (menuAutoHide: boolean) => {
    setAppConfig({ ...appConfig, menuAutoHide });
  });
  // Sets the app horizontal scroll
  monitor.menu.registerMethod('setHorizontalScroll', (horizontalScroll: boolean) => {
    setAppConfig({ ...appConfig, horizontalScroll });
  });
  // Sets the app sprite wrap (when sprite goes out of workspace)
  monitor.menu.registerMethod('setSpriteWrap', (spriteWrap: boolean) => {
    setAppConfig({ ...appConfig, spriteWrap });
  });
  // Sets the app project builder brick size
  monitor.menu.registerMethod('setBrickSize', (brickSize: number) => {
    setAppConfig({ ...appConfig, brickSize });
  });

  // -- Setters for the global project configurations ------------------------

  // Sets the master volume
  monitor.menu.registerMethod('setMasterVolume', (masterVolume: number) => {
    setProjectConfig({ ...projectConfig, masterVolume });
  });

  const [artBoardList, setArtBoardList] = useState(ContextDefaultArtBoard.artBoardList);
  const numberOfArtboards = 5;

  // -- render -------------------------------------------------------------------------------------

  return (
    <ConfigContext.Provider value={{ appConfig, setAppConfig, projectConfig, setProjectConfig }}>
      <main id="app">
        <ArtBoardContext.Provider value={{ artBoardList, setArtBoardList, numberOfArtboards }}>
          <Manager />
        </ArtBoardContext.Provider>
        <Menu />
        <Palette />
      </main>
    </ConfigContext.Provider>
  );
}
