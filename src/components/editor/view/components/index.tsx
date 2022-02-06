import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

// -- resources ------------------------------------------------------------------------------------

import buildSVG from '../resources/build.svg';

// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- private variables ----------------------------------------------------------------------------

let _codeBox: HTMLTextAreaElement;
let _status: HTMLParagraphElement;
let _btnBuild: HTMLButtonElement;

// -- component definition -------------------------------------------------------------------------

/**
 * Editor component.
 * @returns root JSX element of the Editor component
 */
function Editor(): JSX.Element {
  const codeBoxRef = useRef(null);
  const statusRef = useRef(null);
  const btnBuildRef = useRef(null);

  useEffect(() => {
    _codeBox = codeBoxRef.current!;
    _status = statusRef.current!;
    _btnBuild = btnBuildRef.current!;

    fetch(buildSVG)
      .then((res) => res.text())
      .then((svg) => (_btnBuild.innerHTML = svg));
  }, []);

  return (
    <div id="editor">
      <textarea id="editor-codebox" ref={codeBoxRef}></textarea>
      <div id="editor-console">
        <div id="editor-status-wrapper">
          <p id="editor-status" ref={statusRef}></p>
        </div>
        <button id="editor-btn-build" ref={btnBuildRef}></button>
      </div>
    </div>
  );
}

/**
 * Mounts the React component inside the DOM container.
 * @param container DOM container
 * @returns a `Promise` of an object containing the DOM artboard and interactor elements
 */
export function setup(container: HTMLElement): Promise<{
  codeBox: HTMLTextAreaElement;
  status: HTMLParagraphElement;
  btnBuild: HTMLButtonElement;
}> {
  ReactDOM.render(<Editor />, container);

  return new Promise((resolve) => {
    setTimeout(() =>
      resolve({
        codeBox: _codeBox,
        status: _status,
        btnBuild: _btnBuild,
      }),
    );
  });
}
