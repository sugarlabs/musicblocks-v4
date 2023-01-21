// -- ui items -------------------------------------------------------------------------------------

import './index.scss';

// -- component definition -------------------------------------------------------------------------

export default function Splash({ progress }: { progress: number }): JSX.Element {
  return (
    <div id="splash-container">
      <img id="splash-logo" src="/logo.png" alt="Logo" />
      <div id="splash-progress-bar">
        <div id="splash-progress" style={{ width: `${progress + 20}%` }} />
      </div>
    </div>
  );
}
