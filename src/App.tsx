import { useState } from 'react';

// -- context --------------------------------------------------------------------------------------

import { ContextConfig, ContextConfigDefaults } from './context/context-config';

import Monitor from './components/Monitor';

// -- subcomponents --------------------------------------------------------------------------------

import Artboard from './components/artboard/Artboard';
import Builder from './components/builder/Builder';
import Menu from './components/menu/Menu';
import Palette from './components/palette/Palette';
import Manager from './components/artboard/Manager';

// -- stylesheet -----------------------------------------------------------------------------------

import './App.scss';
import { ArtBoardContext, ContextDefaultArtBoard } from './context/ArtBoardContext';

// -- component definition -------------------------------------------------------------------------

export default function App(): JSX.Element {
  const [config, setConfig] = useState(ContextConfigDefaults.config);

  const changeLanguage = (newLanguage: string) => {
    setConfig({ ...config, language: newLanguage });
  };

  const changeBlockSize = (newBlockSize: number) => {
    setConfig({ ...config, blockSize: newBlockSize });
  };

  const updateTurtleWrap = (isWrapOn: boolean) => {
    setConfig({ ...config, turtleWrap: isWrapOn });
  };

  const updateHorizontalScroll = (isEnabled: boolean) => {
    setConfig({ ...config, horizontalScroll: isEnabled });
  };

  const updateVolume = (volume: number) => {
    setConfig({ ...config, masterVolume: volume });
  };

  Monitor.registerSetLanguage(changeLanguage);
  Monitor.registerUpdateScroll(updateHorizontalScroll);
  Monitor.registerUpdateWrap(updateTurtleWrap);
  Monitor.registerSetBlockSize(changeBlockSize);
  Monitor.registerUpdateVolume(updateVolume);
  Monitor.registerClean();

  const [artBoardList, setArtBoardList] = useState(ContextDefaultArtBoard.artBoardList);

  return (
    <ContextConfig.Provider value={{ config, setConfig }}>
      <div id="app">
        <div className="lang-container">Current Language: {config.language}</div>
        {/* <Artboard /> */}
        <ArtBoardContext.Provider value={{ artBoardList, setArtBoardList }}>
          <Manager />
        </ArtBoardContext.Provider>

        {/* <Builder /> */}
        <Menu />
        <Palette />
      </div>
    </ContextConfig.Provider>
  );
}
