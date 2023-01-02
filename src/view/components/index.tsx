import Toolbar from './toolbar';
import Splash from './splash';

import './index.scss';

export default function App(): JSX.Element {
  return (
    <>
      <Splash />
      <Toolbar />
      <div id="workspace"></div>
    </>
  );
}

// -------------------------------------------------------------------------------------------------

import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(
  <React.StrictMode>
    <App></App>
  </React.StrictMode>,
  document.getElementById('root'),
);

// -------------------------------------------------------------------------------------------------


