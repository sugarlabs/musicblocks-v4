import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

// -- resources ------------------------------------------------------------------------------------

import svgHelp from '../resources/help.svg';
import svgBuild from '../resources/build.svg';
import svgClose from '../resources/close.svg';

// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- private variables ----------------------------------------------------------------------------

let _editor: HTMLDivElement;
let _codeBox: HTMLTextAreaElement;
let _btnHelp: HTMLButtonElement;
let _status: HTMLParagraphElement;
let _btnBuild: HTMLButtonElement;
let _btnClose: HTMLButtonElement;
let _helpBox: HTMLTextAreaElement;

let _mountedCallback: CallableFunction;

// -- component definition -------------------------------------------------------------------------

/**
 * Editor component.
 * @returns root JSX element of the Editor component
 */
function Editor(): JSX.Element {
  const codeBoxRef = useRef(null);
  const btnHelpRef = useRef(null);
  const statusRef = useRef(null);
  const btnBuildRef = useRef(null);
  const btnCloseRef = useRef(null);
  const helpBoxRef = useRef(null);

  const [showingHelp, setShowingHelp] = useState(false);

  useEffect(() => {
    _codeBox = codeBoxRef.current!;
    _btnHelp = btnHelpRef.current!;
    _status = statusRef.current!;
    _btnBuild = btnBuildRef.current!;
    _btnClose = btnCloseRef.current!;
    _helpBox = helpBoxRef.current!;

    _mountedCallback();

    _editor.addEventListener('resetstates', () => {
      setShowingHelp(false);
    });

    (
      [
        [svgHelp, _btnHelp],
        [svgBuild, _btnBuild],
        [svgClose, _btnClose],
      ] as [string, HTMLButtonElement][]
    ).forEach(([svgSrc, button]) => {
      fetch(svgSrc)
        .then((res) => res.text())
        .then((svg) => (button.innerHTML = svg));
    });
  }, []);

  return (
    <>
      <div className={`editor-wrapper ${showingHelp ? 'editor-wrapper-hidden' : ''}`}>
        <textarea
          id="editor-codebox"
          ref={codeBoxRef}
          onInput={() => (_status.innerHTML = '')}
        ></textarea>
        <div id="editor-console">
          <button
            id="editor-btn-help"
            ref={btnHelpRef}
            onClick={() => setShowingHelp(true)}
          ></button>
          <div id="editor-status-wrapper">
            <p id="editor-status" ref={statusRef}></p>
          </div>
          <button
            id="editor-btn-build"
            ref={btnBuildRef}
            onClick={() =>
              _editor.dispatchEvent(
                new CustomEvent<string>('buildprogram', {
                  detail: _codeBox.value,
                }),
              )
            }
          ></button>
        </div>
      </div>
      <div className={`editor-wrapper ${!showingHelp ? 'editor-wrapper-hidden' : ''}`}>
        <textarea id="editor-help" ref={helpBoxRef} readOnly></textarea>
        <button
          id="editor-help-close"
          ref={btnCloseRef}
          onClick={() => setShowingHelp(false)}
        ></button>
      </div>
    </>
  );
}

/**
 * Mounts the React component inside the DOM container.
 * @param container DOM container
 * @returns a `Promise` of an object containing the DOM artboard and interactor elements
 */
export function setup(container: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    _editor = container as HTMLDivElement;
    _editor.id = 'editor';

    ReactDOM.render(<Editor />, container);

    _mountedCallback = () => requestAnimationFrame(() => resolve());
  });
}

/**
 * Sets the text code content of the codebox.
 * @param text text code content
 */
export function setCode(text: string): void {
  _codeBox.value = text;
}

/**
 * Sets the text content of the status box.
 * @param text text content
 */
export function setStatus(text: string): void {
  _status.innerHTML = text;
}

/**
 * Sets the text content of the help box.
 * @param text text content
 */
export function setHelp(text: string): void {
  _helpBox.innerHTML = text;
}

/**
 * Resets the component states.
 */
export function resetStates(): void {
  _editor.dispatchEvent(new Event('resetstates'));
}
