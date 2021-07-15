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
// import Palette from './components/palette/Palette';

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

  Monitor.registerSetLanguage(changeLanguage);
  Monitor.registerUpdateScroll(updateHorizontalScroll);
  Monitor.registerUpdateWrap(updateTurtleWrap);
  Monitor.registerSetBlockSize(changeBlockSize);

  return (
    <ContextConfig.Provider value={{ config, setConfig }}>
      <div id="app">
        <div className="lang-container">Current Language: {config.language}</div>
        {/* <Artboard /> */}
        <Manager />
        {/* <Builder /> */}
        <Menu />
        <Palette />
      </div>
    </ContextConfig.Provider>
  );
}
