import { useState } from 'react';

// -- context --------------------------------------------------------------------------------------

import { ContextConfig, ContextConfigDefaults } from './context/context-config';

import Monitor from './components/Monitor';

// -- subcomponents --------------------------------------------------------------------------------

import Artboard from './components/artboard/Artboard';
import Builder from './components/builder/Builder';
import Menu from './components/menu/Menu';

// -- stylesheet -----------------------------------------------------------------------------------

import './App.scss';
import Palette from './components/palette/Palette';

// -- component definition -------------------------------------------------------------------------

export default function App(): JSX.Element {
  const [config, setConfig] = useState(ContextConfigDefaults.config);

  const changeLanguage = (newLanguage: string) => {
    setConfig({ ...config, language: newLanguage });
  };

  Monitor.registerSetLanguage(changeLanguage);

  return (
    <ContextConfig.Provider value={{ config, setConfig }}>
      <div id="app">
        <div className="lang-container">Current Language: {config.language}</div>
        <Artboard />
        <Builder />
        <Menu />
        <Palette />
      </div>
    </ContextConfig.Provider>
  );
}
