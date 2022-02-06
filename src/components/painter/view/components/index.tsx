import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- private variables ----------------------------------------------------------------------------

let _artboard: HTMLDivElement;
let _interactor: HTMLDivElement;

// -- component definition -------------------------------------------------------------------------

/**
 * Painter component.
 * @returns root JSX element of the Painter component
 */
function Painter(): JSX.Element {
  const artboardRef = useRef(null);
  const interactorRef = useRef(null);

  useEffect(() => {
    _artboard = artboardRef.current!;
    _interactor = interactorRef.current!;
  }, []);

  return (
    <>
      <section id="artboard-wrapper">
        <div id="artboard-background"></div>
        <div id="artboard-container">
          <div className="artboard" ref={artboardRef}></div>
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
  interactor: HTMLDivElement;
}> {
  ReactDOM.render(<Painter />, container);

  return new Promise((resolve) => {
    setTimeout(() =>
      resolve({
        artboard: _artboard,
        interactor: _interactor,
      }),
    );
  });
}
