import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

import { setupCartesian } from './utils/background';

// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- private variables ----------------------------------------------------------------------------

let _artboard: HTMLDivElement;
let _artboardBackground: HTMLDivElement;
let _interactor: HTMLDivElement;

let _mountedCallback: CallableFunction;

// -- component definition -------------------------------------------------------------------------

/**
 * Painter component.
 * @returns root JSX element of the Painter component
 */
function Painter(): JSX.Element {
  const backgroundRef = useRef(null);
  const artboardRef = useRef(null);
  const artboardBackgroundRef = useRef(null);
  const interactorRef = useRef(null);

  useEffect(() => {
    _artboard = artboardRef.current!;
    _artboardBackground = artboardBackgroundRef.current!;
    _interactor = interactorRef.current!;

    _mountedCallback();

    setupCartesian(backgroundRef.current!);
  }, []);

  return (
    <>
      <section id="artboard-wrapper">
        <div id="artboard-background" ref={backgroundRef}></div>
        <div id="artboard-container">
          <div className="artboard" ref={artboardRef}></div>
          <div className="artboard-background" ref={artboardBackgroundRef}></div>
        </div>
        <div id="artboard-interactor" ref={interactorRef}></div>
      </section>
    </>
  );
}

/**
 * Mounts the React component inside the DOM container.
 * @param container DOM container
 * @returns a `Promise` of an object containing the DOM artboard and interactor elements
 */
export function setup(container: HTMLElement): Promise<{
  artboard: HTMLDivElement;
  artboardBackground: HTMLDivElement;
  interactor: HTMLDivElement;
}> {
  return new Promise((resolve) => {
    ReactDOM.render(<Painter />, container);

    _mountedCallback = () =>
      requestAnimationFrame(() => {
        resolve({
          artboard: _artboard,
          artboardBackground: _artboardBackground,
          interactor: _interactor,
        });
      });
  });
}
