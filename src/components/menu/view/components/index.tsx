import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

// -- resources ------------------------------------------------------------------------------------

import svgRun from '../resources/run.svg';
import svgStop from '../resources/stop.svg';
import svgReset from '../resources/reset.svg';

// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- private variables ----------------------------------------------------------------------------

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
function Menu(props: { labels: { run: string; stop: string; reset: string } }): JSX.Element {
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
        .then(() => (element.children[1] as SVGElement).classList.add('menu-btn-img'));
    };

    loadSVG(btnRunRef.current! as HTMLElement, svgRun);
    loadSVG(btnStopRef.current! as HTMLElement, svgStop);
    loadSVG(btnResetRef.current! as HTMLElement, svgReset);
  }, []);

  return (
    <>
      <button className="menu-btn" ref={btnRunRef}>
        <p className="menu-btn-label">
          <span>{props.labels.run}</span>
        </p>
      </button>
      <button className="menu-btn" ref={btnStopRef}>
        <p className="menu-btn-label">
          <span>{props.labels.stop}</span>
        </p>
      </button>
      <button className="menu-btn" ref={btnResetRef}>
        <p className="menu-btn-label">
          <span>{props.labels.reset}</span>
        </p>
      </button>
    </>
  );
}

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
  return new Promise((resolve) => {
    ReactDOM.render(<Menu labels={props.labels} />, container);

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
