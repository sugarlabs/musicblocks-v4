import { useState } from 'react';

// -- context --------------------------------------------------------------------------------------

import { IContextConfig } from './@types/context';
import { ContextConfig, ContextConfigDefaults } from './context/context-config';

// -- subcomponents --------------------------------------------------------------------------------

import Artboard from './components/artboard/Artboard';
import Builder from './components/builder/Builder';
import Menu from './components/menu/Menu';
import Palette from './components/palette/Palette';
import Manager from './components/artboard/Manager';

// -- stylesheet -----------------------------------------------------------------------------------

import './App.scss';

// -- component definition -------------------------------------------------------------------------

export default function App(): JSX.Element {
  const [config] = useState<IContextConfig>(ContextConfigDefaults);

  return (
    <ContextConfig.Provider value={{ ...config }}>
      <div id="app">
        {/* <Artboard /> */}
        <Manager />
        {/* <Builder /> */}
        <Menu />
        <Palette />
      </div>
    </ContextConfig.Provider>
  );
}
