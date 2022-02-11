import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

// -- resources ------------------------------------------------------------------------------------

import buildSVG from '../resources/build.svg';

// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- private variables ----------------------------------------------------------------------------

let _codeBox: HTMLTextAreaElement;
let _status: HTMLParagraphElement;
let _btnBuild: HTMLButtonElement;

let _mountedCallback: CallableFunction;

// -- component definition -------------------------------------------------------------------------

/**
 * Editor component.
 * @returns root JSX element of the Editor component
 */
function Editor(): JSX.Element {
  const codeBoxRef = useRef(null);
  const statusRef = useRef(null);
  const btnBuildRef = useRef(null);
  const [linesCount, setlinesCount] = useState('1\n2\n3\n4\n5\n6\n7\n8\n9\n10');

  useEffect(() => {
    _codeBox = codeBoxRef.current!;
    _status = statusRef.current!;
    _btnBuild = btnBuildRef.current!;

    _mountedCallback();

    fetch(buildSVG)
      .then((res) => res.text())
      .then((svg) => (_btnBuild.innerHTML = svg));
  }, []);

  // handles editor line numbers overflow scrolling
  (function () {
    const target = $('#editor-codebox-line-numbers');
    $('#editor-codebox').on('scroll', function () {
      target.prop('scrollTop', this.scrollTop).prop('scrollLeft', this.scrollLeft);
    });
  })();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const codeText = e.target.value;
    const newLines = codeText.split(/\r\n|\r|\n/).length;

    let lineNumber = '';
    for (let i = 0; i < newLines; i++) {
      const num = (i + 1).toString();
      lineNumber += num;
      lineNumber += '\n';
    }
    setlinesCount(lineNumber);
  };

  return (
    <div id="editor">
      <div id="editor-codebox-wrapper">
        <p id="editor-codebox-line-numbers">{linesCount}</p>
        <textarea
          id="editor-codebox"
          ref={codeBoxRef}
          onChange={(e) => {
            handleChange(e);
          }}
        ></textarea>
      </div>
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
  return new Promise((resolve) => {
    ReactDOM.render(<Editor />, container);

    _mountedCallback = () =>
      requestAnimationFrame(() =>
        resolve({
          codeBox: _codeBox,
          status: _status,
          btnBuild: _btnBuild,
        }),
      );
  });
}
