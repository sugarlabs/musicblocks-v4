import type { TAssetIdentifierMenu, TPropsMenu } from '@/@types/components/menu';

import { useEffect, useRef } from 'react';
import { render } from 'react-dom';

// -- ui items -------------------------------------------------------------------------------------

import './index.scss';

// -- component definition -------------------------------------------------------------------------

export function Menu(props: TPropsMenu): JSX.Element {
  const btnRunRef = useRef(null);
  const btnStopRef = useRef(null);
  const btnResetRef = useRef(null);

  const btnUploadFileInLocalStorageRef = useRef(null);
  const btnStartRecordingRef = useRef(null);
  const btnStopRecordingRef = useRef(null);
  const btnExportDrawingRef = useRef(null);
  const btnLoadProjectRef = useRef(null);
  const btnSaveProjectRef = useRef(null);

  useEffect(() => {
    (async function () {
      async function loadAssets(items: [HTMLElement, TAssetIdentifierMenu][]): Promise<void> {
        return new Promise((resolve) => {
          items.forEach(([element, assetIdentifier]) => {
            element.innerHTML += props.injected.assets[assetIdentifier].data;
          });
          requestAnimationFrame(() => {
            items.forEach(([element]) => {
              (element.children[1] as SVGElement).classList.add('menu-btn-img');
            });
            resolve();
          });
        });
      }

      await loadAssets([
        [btnRunRef.current! as HTMLElement, 'image.icon.run'],
        [btnStopRef.current! as HTMLElement, 'image.icon.stop'],
        [btnResetRef.current! as HTMLElement, 'image.icon.reset'],
        [btnStartRecordingRef.current! as HTMLElement, 'image.icon.startRecording'],
        [btnStopRecordingRef.current! as HTMLElement, 'image.icon.stopRecording'],
        [btnExportDrawingRef.current! as HTMLElement, 'image.icon.exportDrawing'],
        [btnSaveProjectRef.current! as HTMLElement, 'image.icon.saveProjectHTML'],
      ]);
    })();
  }, []);

  return (
    <>
      <>
        <label className="menu-input-btn-label">
          <input
            type="file"
            className={`menu-btn ${!props.injected.flags.uploadFile ? 'menu-btn-hidden' : ''}`}
            ref={btnUploadFileInLocalStorageRef}
            multiple={true}
          ></input>
        </label>

        <button
          className={`menu-btn ${!props.injected.flags.recording ? 'menu-btn-hidden' : ''}`}
          ref={btnStartRecordingRef}
        >
          <p className="menu-btn-label">
            <span>{'Start animation Recording'}</span>
          </p>
        </button>

        <button
          className={`menu-btn ${!props.injected.flags.recording ? 'menu-btn-hidden' : ''}`}
          ref={btnStopRecordingRef}
        >
          <p className="menu-btn-label">
            <span>{'Stop animation Recording'}</span>
          </p>
        </button>

        <button
          className={`menu-btn ${!props.injected.flags.exportDrawing ? 'menu-btn-hidden' : ''}`}
          ref={btnExportDrawingRef}
        >
          <p className="menu-btn-label">
            <span>{'Save mouse artwork as PNG'}</span>
          </p>
        </button>

        <label className="menu-input-btn-label">
          <input
            type="file"
            className={`menu-btn ${!props.injected.flags.loadProject ? 'menu-btn-hidden' : ''}`}
            ref={btnLoadProjectRef}
            accept="text/html"
          ></input>
        </label>

        <button
          className={`menu-btn ${!props.injected.flags.saveProject ? 'menu-btn-hidden' : ''}`}
          ref={btnSaveProjectRef}
        >
          <p className="menu-btn-label">
            <span>{'Save Project as HTML'}</span>
          </p>
        </button>
      </>

      <button
        className={`menu-btn ${props.states['running'] ? 'menu-btn-hidden' : ''}`}
        ref={btnRunRef}
        onClick={() => (props.handlers.run ? props.handlers.run() : undefined)}
      >
        <p className="menu-btn-label">
          <span>{props.injected.i18n['menu.run']}</span>
        </p>
      </button>
      <button
        className={`menu-btn ${!props.states['running'] ? 'menu-btn-hidden' : ''}`}
        ref={btnStopRef}
        onClick={() => (props.handlers.stop ? props.handlers.stop() : undefined)}
      >
        <p className="menu-btn-label">
          <span>{props.injected.i18n['menu.stop']}</span>
        </p>
      </button>
      <button
        className="menu-btn"
        ref={btnResetRef}
        onClick={() => (props.handlers.reset ? props.handlers.reset() : undefined)}
      >
        <p className="menu-btn-label">
          <span>{props.injected.i18n['menu.reset']}</span>
        </p>
      </button>
    </>
  );
}

export async function renderComponent(container: HTMLElement, props: TPropsMenu): Promise<void> {
  return new Promise((resolve) => {
    render(<Menu {...props} />, container);
    requestAnimationFrame(() => resolve());
  });
}
