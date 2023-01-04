import React from 'react';
import ReactDOM from 'react-dom';
import Toolbar from './toolbar';
import Splash from './Splash';
import './index.scss';


export function mountSplash() {
  ReactDOM.render(
    <Splash progress={0} />,
    document.getElementById('root'),
  );
}

export function updateSplash(componentCount : number, componentLoadedCount : number) {
  const progress = (componentLoadedCount / componentCount) * 100;
  ReactDOM.render(
    <Splash progress={progress} />,
    document.getElementById('root'),
  );
}

export function unmountSplash() {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    ReactDOM.unmountComponentAtNode(rootElement);
  }
}

function App(): JSX.Element {
  return (
    <>
      <Toolbar />
      <div id="workspace"></div>
    </>
  );
}

ReactDOM.render(
  <React.StrictMode>
    
    <App></App>
  </React.StrictMode>,
  document.getElementById('root'),
);
