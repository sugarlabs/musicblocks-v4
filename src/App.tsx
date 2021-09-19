import { useState } from 'react';

// -- context --------------------------------------------------------------------------------------

import { appConfigDefaults, ConfigContext, projectConfigDefaults } from './context/config';

// -- subcomponents --------------------------------------------------------------------------------

import Monitor from './components/Monitor';
import Menu from './components/menu/Menu';
import Palette from './components/palette/Palette';
import Manager from './components/artboard/Manager';

// -- stylesheet -----------------------------------------------------------------------------------

import './App.scss';
import { ArtBoardContext, ContextDefaultArtBoard } from './context/ArtBoardContext';
import { TAppTheme } from './@types/config';

// -- component definition -------------------------------------------------------------------------

export default function App(): JSX.Element {
  const [appConfig, setAppConfig] = useState(appConfigDefaults);
  const [projectConfig, setProjectConfig] = useState(projectConfigDefaults);

  // App relies on the following properties being set here
  Monitor.menu.setTheme = (theme: TAppTheme) => {
    setAppConfig({ ...appConfig, theme });
  };
  Monitor.menu.setLanguage = (language) => {
    setAppConfig({ ...appConfig, language });
  };
  Monitor.menu.setHorizontalScroll = (horizontalScroll: boolean) => {
    setAppConfig({ ...appConfig, horizontalScroll });
  };
  Monitor.menu.setTurtleWrap = (turtleWrap: boolean) => {
    setAppConfig({ ...appConfig, turtleWrap });
  };
  Monitor.menu.setBrickSize = (blockSize: number) => {
    setAppConfig({ ...appConfig, blockSize });
  };

  // App relies on the following properties being set here
  Monitor.menu.setMasterVolume = (masterVolume: number) => {
    setProjectConfig({ ...projectConfig, masterVolume });
  };

  const changeBlockSize = (newBlockSize: number) => {
    setAppConfig({ ...appConfig, blockSize: newBlockSize });
  };

  const updateTurtleWrap = (isWrapOn: boolean) => {
    setAppConfig({ ...appConfig, turtleWrap: isWrapOn });
  };

  const updateHorizontalScroll = (isEnabled: boolean) => {
    setAppConfig({ ...appConfig, horizontalScroll: isEnabled });
  };

  // const updateVolume = (volume: number) => {
  //   setAppConfig({ ...appConfig, masterVolume: volume });
  // };

  Monitor.registerUpdateScroll(updateHorizontalScroll);
  Monitor.registerUpdateWrap(updateTurtleWrap);
  Monitor.registerSetBlockSize(changeBlockSize);
  // Monitor.registerUpdateVolume(updateVolume);
  Monitor.registerClean();

  const [artBoardList, setArtBoardList] = useState(ContextDefaultArtBoard.artBoardList);
  const numberOfArtboards = 5;

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
