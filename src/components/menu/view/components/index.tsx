import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

// -- resources ------------------------------------------------------------------------------------

import svgRun from '../resources/run.svg';
import svgStop from '../resources/stop.svg';
import svgReset from '../resources/reset.svg';

// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- private variables ----------------------------------------------------------------------------

let _container: HTMLElement;
let _labels: { run: string; stop: string; reset: string };
let _states: { running: boolean } = { running: false };

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
  const btnRunRef = useRef(null);
  const btnStopRef = useRef(null);
  const btnResetRef = useRef(null);

  useEffect(() => {
    _btnRun = btnRunRef.current!;
    _btnStop = btnStopRef.current!;
    _btnReset = btnResetRef.current!;

    _mountedCallback();

    const loadSVG = (element: HTMLElement, svgSrc: string) => {
      fetch(svgSrc)
        .then((res) => res.text())
        .then((svg) => (element.innerHTML += svg))
        .then(() => (element.children[1] as SVGElement).classList.add('toolbar-btn-img'));
    };

    loadSVG(btnRunRef.current! as HTMLElement, svgRun);
    loadSVG(btnStopRef.current! as HTMLElement, svgStop);
    loadSVG(btnResetRef.current! as HTMLElement, svgReset);
  }, []);

  return (
    <>
      <button
        className={`toolbar-cluster-item-btn menu-btn ${
          props.states['running'] ? 'menu-btn-hidden' : ''
        }`}
        ref={btnRunRef}
      >
        <p className="toolbar-btn-label">
          <span>{_labels.run}</span>
        </p>
      </button>
      <button
        className={`toolbar-cluster-item-btn menu-btn ${
          !props.states['running'] ? 'menu-btn-hidden' : ''
        }`}
        ref={btnStopRef}
      >
        <p className="toolbar-btn-label">
          <span>{_labels.stop}</span>
        </p>
      </button>
      <button className="toolbar-cluster-item-btn menu-btn" ref={btnResetRef}>
        <p className="toolbar-btn-label">
          <span>{_labels.reset}</span>
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
    labels: { run: string; stop: string; reset: string };
  },
): Promise<{
  btnRun: HTMLButtonElement;
  btnStop: HTMLButtonElement;
  btnReset: HTMLButtonElement;
}> {
  _container = container;
  _labels = props.labels;

  return new Promise((resolve) => {
    _renderComponent();

    _mountedCallback = () =>
      requestAnimationFrame(() => {
        resolve({
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
