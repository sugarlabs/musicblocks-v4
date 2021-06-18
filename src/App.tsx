import { useState } from 'react';

// -- context --------------------------------------------------------------------------------------

import { IContextConfig } from './@types/context';
import { ContextConfig, ContextConfigDefaults } from './context/context-config';

// -- subcomponents --------------------------------------------------------------------------------

import Artboard from './components/artboard/Artboard';
import Builder from './components/builder/Builder';
import Menu from './components/menu/Menu';
import Palette from './components/palette/Palette';

// -- stylesheet -----------------------------------------------------------------------------------

import './App.scss';

// -- component ------------------------------------------------------------------------------------

export default function App(): JSX.Element {
  const [config] = useState<IContextConfig>(ContextConfigDefaults);

  return (
    <ContextConfig.Provider value={{ ...config }}>
      <div id="app">
        <Artboard />
        <Builder />
        <Menu />
        <Palette />
      </div>
    </ContextConfig.Provider>
  );
}
