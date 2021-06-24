import { useState } from 'react';

// -- context --------------------------------------------------------------------------------------

import { ContextConfig, ContextConfigDefaults } from './context/context-config';

// -- subcomponents --------------------------------------------------------------------------------

import Artboard from './components/artboard/Artboard';
import Builder from './components/builder/Builder';
import Menu from './components/menu/Menu';
import Palette from './components/palette/Palette';

// -- stylesheet -----------------------------------------------------------------------------------

import './App.scss';

// -- component definition -------------------------------------------------------------------------

export default function App(): JSX.Element {
  const [config, setConfig] = useState(ContextConfigDefaults.config);

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
