import Toolbar from './components/Toolbar';

import './App.scss';

export default function (): JSX.Element {
  return (
    <>
      <Toolbar />
      <div id="workspace"></div>
    </>
  );
}
