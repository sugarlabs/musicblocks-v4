import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- private variables ----------------------------------------------------------------------------

let btnRun: HTMLButtonElement;
let btnStop: HTMLButtonElement;
let btnReset: HTMLButtonElement;

// -- component definition -------------------------------------------------------------------------

/**
 * Menu component.
 * @params props React props (SVG sources)
 * @returns root JSX element of the Menu component
 */
function Menu(props: {
  svgs: { run: string; stop: string; reset: string };
  labels: { run: string; stop: string; reset: string };
}): JSX.Element {
  const btnRunRef = useRef(null);
  const btnStopRef = useRef(null);
  const btnResetRef = useRef(null);

  useEffect(() => {
    const loadSVG = (element: HTMLElement, svgSrc: string) => {
      fetch(svgSrc)
        .then((res) => res.text())
        .then((svg) => (element.innerHTML += svg))
        .then(() => (element.children[1] as SVGElement).classList.add('menu-btn-img'));
    };

    loadSVG(btnRunRef.current! as HTMLElement, props.svgs.run);
    loadSVG(btnStopRef.current! as HTMLElement, props.svgs.stop);
    loadSVG(btnResetRef.current! as HTMLElement, props.svgs.reset);

    btnRun = btnRunRef.current!;
    btnStop = btnStopRef.current!;
    btnReset = btnResetRef.current!;
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
    svgs: { run: string; stop: string; reset: string };
    labels: { run: string; stop: string; reset: string };
  },
): Promise<{
  btnRun: HTMLButtonElement;
  btnStop: HTMLButtonElement;
  btnReset: HTMLButtonElement;
}> {
  ReactDOM.render(<Menu svgs={props.svgs} labels={props.labels} />, container);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        btnRun,
        btnStop,
        btnReset,
      });
    });
  });
}
