import type { TFeatureFlagMenu, TI18nFuncMenu } from '@/@types/components/menu';

import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

import { getAsset } from '@/core/assets';

// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- private variables ----------------------------------------------------------------------------

let _container: HTMLElement;
let _labels: {
  uploadFileInLocalStorage: string;
  startRecording: string;
  stopRecording: string;
  exportDrawing: string;
  loadProject: string;
  saveProject: string;
};
let _flags: TFeatureFlagMenu;
let _states: { running: boolean } = { running: false };
let _i18n: TI18nFuncMenu;

let _btnUploadFileInLocalStorage: HTMLInputElement;
let _btnStartRecording: HTMLButtonElement;
let _btnStopRecording: HTMLButtonElement;
let _btnExportDrawing: HTMLButtonElement;
let _btnLoadProject: HTMLInputElement;
let _btnSaveProject: HTMLButtonElement;
let _btnRun: HTMLButtonElement;
let _btnStop: HTMLButtonElement;
let _btnReset: HTMLButtonElement;

let _mountedCallback: CallableFunction;

// -- component definition -------------------------------------------------------------------------

/**
 * Menu component.
 * @params props React props (SVG sources)
 * @returns root JSX element of the Menu component
 */
function Menu(props: { states: { running: boolean } }): JSX.Element {
  const btnUploadFileInLocalStorageRef = useRef(null);
  const btnStartRecordingRef = useRef(null);
  const btnStopRecordingRef = useRef(null);
  const btnExportDrawingRef = useRef(null);
  const btnLoadProjectRef = useRef(null);
  const btnSaveProjectRef = useRef(null);
  const btnRunRef = useRef(null);
  const btnStopRef = useRef(null);
  const btnResetRef = useRef(null);

  useEffect(() => {
    _btnUploadFileInLocalStorage = btnUploadFileInLocalStorageRef.current!;
    _btnStartRecording = btnStartRecordingRef.current!;
    _btnStopRecording = btnStopRecordingRef.current!;
    _btnExportDrawing = btnExportDrawingRef.current!;
    _btnLoadProject = btnLoadProjectRef.current!;
    _btnSaveProject = btnSaveProjectRef.current!;
    _btnRun = btnRunRef.current!;
    _btnStop = btnStopRef.current!;
    _btnReset = btnResetRef.current!;

    _mountedCallback();

    if (_flags) {
      Object.entries(_flags).forEach(([flag, value]) => {
        flag;
        value;

        if (value === true) return;

        switch (flag) {
          case 'uploadFile':
            _btnUploadFileInLocalStorage.style.display = 'none';
            break;
          case 'recording':
            _btnStartRecording.style.display = 'none';
            _btnStopRecording.style.display = 'none';
            break;
          case 'exportDrawing':
            _btnExportDrawing.style.display = 'none';
            break;
          case 'loadProject':
            _btnLoadProject.style.display = 'none';
            break;
          case 'saveProject':
            _btnSaveProject.style.display = 'none';
            break;
        }
      });
    }

    const loadAsset = (element: HTMLElement, assetIdentifier: string) => {
      element.innerHTML += getAsset('image', assetIdentifier)?.data;
      requestAnimationFrame(() =>
        (element.children[1] as SVGElement).classList.add('menu-btn-img'),
      );
    };

    loadAsset(btnRunRef.current! as HTMLElement, 'image.icon.run');
    loadAsset(btnStopRef.current! as HTMLElement, 'image.icon.stop');
    loadAsset(btnResetRef.current! as HTMLElement, 'image.icon.reset');

    loadAsset(btnStartRecordingRef.current! as HTMLElement, 'image.icon.startRecording');
    loadAsset(btnStopRecordingRef.current! as HTMLElement, 'image.icon.stopRecording');
    loadAsset(btnExportDrawingRef.current! as HTMLElement, 'image.icon.exportDrawing');
    // loadAsset(btnLoadProjectRef.current! as HTMLElement, 'image.icon.loadProject');
    loadAsset(btnSaveProjectRef.current! as HTMLElement, 'image.icon.saveProjectHTML');
  }, []);

  return (
    <>
      <label className="menu-input-btn-label">
        <input
          type="file"
          className="menu-btn"
          ref={btnUploadFileInLocalStorageRef}
          multiple={true}
        ></input>
      </label>

      <button className="menu-btn" ref={btnStartRecordingRef}>
        <p className="menu-btn-label">
          <span>{_labels.startRecording}</span>
        </p>
      </button>

      <button className="menu-btn" ref={btnStopRecordingRef}>
        <p className="menu-btn-label">
          <span>{_labels.stopRecording}</span>
        </p>
      </button>

      <button className="menu-btn" ref={btnExportDrawingRef}>
        <p className="menu-btn-label">
          <span>{_labels.exportDrawing}</span>
        </p>
      </button>

      <label className="menu-input-btn-label">
        <input type="file" className="menu-btn" ref={btnLoadProjectRef} accept="text/html"></input>
      </label>

      <button className="menu-btn" ref={btnSaveProjectRef}>
        <p className="menu-btn-label">
          <span>{_labels.saveProject}</span>
        </p>
      </button>

      <button
        className={`menu-btn ${props.states['running'] ? 'menu-btn-hidden' : ''}`}
        ref={btnRunRef}
      >
        <p className="menu-btn-label">
          <span>{_i18n('run')}</span>
        </p>
      </button>
      <button
        className={`menu-btn ${!props.states['running'] ? 'menu-btn-hidden' : ''}`}
        ref={btnStopRef}
      >
        <p className="menu-btn-label">
          <span>{_i18n('stop')}</span>
        </p>
      </button>
      <button className="menu-btn" ref={btnResetRef}>
        <p className="menu-btn-label">
          <span>{_i18n('reset')}</span>
        </p>
      </button>
    </>
  );
}

// -- private functions ----------------------------------------------------------------------------

/**
 * Calls the renderer for the Menu component.
 */
function _renderComponent(): void {
  ReactDOM.render(<Menu states={{ ..._states }} />, _container);
}

// -- public functions -----------------------------------------------------------------------------

/**
 * Setup the Menu component.
 * @param container DOM container for the Menu component.
 * @param props Menu component props
 * @returns a `Promise` that the component has been mounted
 */
export function setup(
  container: HTMLElement,
  props: {
    labels: {
      uploadFileInLocalStorage: string;
      startRecording: string;
      stopRecording: string;
      exportDrawing: string;
      loadProject: string;
      saveProject: string;
    };
  },
  utils: {
    flags: TFeatureFlagMenu;
    i18n: TI18nFuncMenu;
  },
): Promise<{
  btnUploadFileInLocalStorage: HTMLInputElement;
  btnStartRecording: HTMLButtonElement;
  btnStopRecording: HTMLButtonElement;
  btnExportDrawing: HTMLButtonElement;
  btnLoadProject: HTMLInputElement;
  btnSaveProject: HTMLButtonElement;
  btnRun: HTMLButtonElement;
  btnStop: HTMLButtonElement;
  btnReset: HTMLButtonElement;
}> {
  _container = container;
  _labels = props.labels;
  _flags = utils.flags;
  _i18n = utils.i18n;

  return new Promise((resolve) => {
    _renderComponent();

    _mountedCallback = () =>
      requestAnimationFrame(() => {
        resolve({
          btnUploadFileInLocalStorage: _btnUploadFileInLocalStorage,
          btnStartRecording: _btnStartRecording,
          btnStopRecording: _btnStopRecording,
          btnExportDrawing: _btnExportDrawing,
          btnLoadProject: _btnLoadProject,
          btnSaveProject: _btnSaveProject,
          btnRun: _btnRun,
          btnStop: _btnStop,
          btnReset: _btnReset,
        });
      });
  });
}

/**
 * Updates the component state.
 * @param state state name
 * @param value value of the state
 */
export function updateState(state: 'running', value: boolean): void {
  const newStates = { ..._states };
  newStates[state] = value;
  _states = newStates;

  _renderComponent();
}
