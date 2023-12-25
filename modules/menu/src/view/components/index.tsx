import type { Root } from 'react-dom/client';
import type { TPropsMenu } from '#/@types/components/menu';

import { createRoot } from 'react-dom/client';

// -- ui items -------------------------------------------------------------------------------------

import { SImage } from '@sugarlabs/mb4-components';

import './index.scss';

// -- component definition -------------------------------------------------------------------------

export function Menu(props: TPropsMenu): JSX.Element {
  return (
    <>
      <>
        <label className={`menu-btn ${!props.injected.flags.uploadFile ? 'menu-btn-hidden' : ''}`}>
          <p className="menu-btn-label">
            <span>{'Export Project'}</span>
          </p>
          <div className="menu-btn-img">
            <SImage asset={props.injected.assets['image.icon.uploadFile']} />
          </div>
          <input type="file" className="menu-btn-input" multiple={true}></input>
        </label>

        <button className={`menu-btn ${!props.injected.flags.recording ? 'menu-btn-hidden' : ''}`}>
          <p className="menu-btn-label">
            <span>{'Start animation Recording'}</span>
          </p>
          <div className="menu-btn-img">
            <SImage asset={props.injected.assets['image.icon.startRecording']} />
          </div>
        </button>

        <button className={`menu-btn ${!props.injected.flags.recording ? 'menu-btn-hidden' : ''}`}>
          <p className="menu-btn-label">
            <span>{'Stop animation Recording'}</span>
          </p>
          <div className="menu-btn-img">
            <SImage asset={props.injected.assets['image.icon.stopRecording']} />
          </div>
        </button>

        <button
          className={`menu-btn ${!props.injected.flags.exportDrawing ? 'menu-btn-hidden' : ''}`}
        >
          <p className="menu-btn-label">
            <span>{'Save mouse artwork as PNG'}</span>
          </p>
          <div className="menu-btn-img">
            <SImage asset={props.injected.assets['image.icon.exportDrawing']} />
          </div>
        </button>

        <label className={`menu-btn ${!props.injected.flags.loadProject ? 'menu-btn-hidden' : ''}`}>
          <p className="menu-btn-label">
            <span>{'Import Project'}</span>
          </p>
          <div className="menu-btn-img">
            <SImage asset={props.injected.assets['image.icon.loadProject']} />
          </div>
          <input type="file" className="menu-btn-input" accept="text/html"></input>
        </label>

        <button
          className={`menu-btn ${!props.injected.flags.saveProject ? 'menu-btn-hidden' : ''}`}
        >
          <p className="menu-btn-label">
            <span>{'Save Project as HTML'}</span>
          </p>
          <div className="menu-btn-img">
            <SImage asset={props.injected.assets['image.icon.saveProjectHTML']} />
          </div>
        </button>
      </>

      {/* -- RUN ----------------------------------------------------------- */}
      <button
        className={`menu-btn ${props.states['running'] ? 'menu-btn-hidden' : ''}`}
        onClick={() => (props.handlers.run ? props.handlers.run() : undefined)}
      >
        <p className="menu-btn-label">
          <span>{props.injected.i18n['menu.run']}</span>
        </p>
        <div className="menu-btn-img">
          <SImage asset={props.injected.assets['image.icon.run']} />
        </div>
      </button>

      {/* -- STOP ---------------------------------------------------------- */}
      <button
        className={`menu-btn ${!props.states['running'] ? 'menu-btn-hidden' : ''}`}
        onClick={() => (props.handlers.stop ? props.handlers.stop() : undefined)}
      >
        <p className="menu-btn-label">
          <span>{props.injected.i18n['menu.stop']}</span>
        </p>
        <div className="menu-btn-img">
          <SImage asset={props.injected.assets['image.icon.stop']} />
        </div>
      </button>

      {/* -- RESET --------------------------------------------------------- */}
      <button
        className="menu-btn"
        onClick={() => (props.handlers.reset ? props.handlers.reset() : undefined)}
      >
        <p className="menu-btn-label">
          <span>{props.injected.i18n['menu.reset']}</span>
        </p>
        <div className="menu-btn-img">
          <SImage asset={props.injected.assets['image.icon.reset']} />
        </div>
      </button>
    </>
  );
}

// -- private variables ----------------------------------------------------------------------------

let _rootContainer: Root;

// -- public functions -----------------------------------------------------------------------------

export async function renderComponent(container: HTMLElement, props: TPropsMenu): Promise<void> {
  if (_rootContainer === undefined) _rootContainer = createRoot(container);
  _rootContainer.render(<Menu {...props} />);

  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
