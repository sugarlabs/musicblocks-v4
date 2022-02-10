import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

// -- resources ------------------------------------------------------------------------------------

import svgClose from '../../resources/close.svg';

// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- component definition -------------------------------------------------------------------------

/**
 * React functional component for a Toolbar Button.
 * @param props react props
 * @returns root JSX element of the Toolbar Button component
 */
function ToolbarBtn(props: {
  btnImgSVG: string;
  label: string;
  state: 'clicked' | 'unclicked';
}): JSX.Element {
  const btnLabelRef = useRef(null);
  const btnImgRef = useRef(null);
  const btnImgCloseRef = useRef(null);

  useEffect(() => {
    fetch(svgClose)
      .then((res) => res.text())
      .then((svg) => {
        const btnImgClose = btnImgCloseRef.current! as HTMLButtonElement;
        const dummyDiv = document.createElement('div');
        dummyDiv.innerHTML = svg;
        requestAnimationFrame(() => {
          const svg = dummyDiv.firstChild! as SVGSVGElement;
          svg.classList.add('toolbar-btn-img');
          btnImgClose.parentNode!.replaceChild(svg, btnImgClose);
        });
      });
  }, []);

  useEffect(() => {
    if (btnImgRef.current && props.btnImgSVG !== '') {
      const btnImg = btnImgRef.current as HTMLButtonElement;
      const dummyDiv = document.createElement('div');
      dummyDiv.innerHTML = props.btnImgSVG;
      requestAnimationFrame(() => {
        const svg = dummyDiv.firstChild! as SVGSVGElement;
        svg.classList.add('toolbar-btn-img');
        btnImg.parentNode!.replaceChild(dummyDiv.firstChild!, btnImg);
      });
    }
  }, [props.btnImgSVG]);

  useEffect(() => {
    if (props.label !== '') {
      ((btnLabelRef.current! as HTMLParagraphElement).firstChild! as HTMLSpanElement).innerHTML =
        props.label;
    }
  }, [props.label]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const btn = btnLabelRef.current!.parentNode;
    const imgs = [...btn.children].slice(1);
    imgs.forEach((img) => img.classList.remove('toolbar-btn-img-hidden'));
    imgs[props.state === 'clicked' ? 0 : 1]!.classList.add('toolbar-btn-img-hidden');
  }, [props.state]);

  return (
    <>
      <p
        className={`toolbar-btn-label ${
          props.state === 'clicked' ? 'toolbar-btn-label-hidden' : ''
        }`}
        ref={btnLabelRef}
      >
        <span></span>
      </p>
      <div ref={btnImgRef}></div>
      <div ref={btnImgCloseRef}></div>
    </>
  );
}

// -- private functions ----------------------------------------------------------------------------

/**
 * Calls the renderer for the Toolbar Button component.
 * @param props react props
 * @param element button DOM element
 */
function _renderComponent(
  props: {
    btnImgSVG: string;
    label: string;
    state: 'clicked' | 'unclicked';
  },
  element: HTMLButtonElement,
): void {
  ReactDOM.render(
    <ToolbarBtn btnImgSVG={props.btnImgSVG} label={props.label} state={props.state} />,
    element,
  );
}

// -- public functions -----------------------------------------------------------------------------

/**
 * Creates a Toolbar Button element.
 * @returns DOM button element
 */
export function createToolbarButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.classList.add('toolbar-cluster-item-btn');
  _renderComponent({ btnImgSVG: '', label: '', state: 'clicked' }, button);
  return button;
}

/**
 * Updates the view of a Toolbar Button.
 * @param btnImgSVG SVG string for the button's image
 * @param label label of the button
 * @param element DOM button element
 */
export function updateButtonView(
  btnImgSVG: string,
  label: string,
  element: HTMLButtonElement,
): void {
  _renderComponent({ btnImgSVG, label, state: 'clicked' }, element);
}

/**
 * Updates the state of a Toolbar Button.
 * @param state `clicked` or `unclicked`
 * @param element DOM button element
 */
export function updateButtonState(
  state: 'clicked' | 'unclicked',
  element: HTMLButtonElement,
): void {
  _renderComponent({ btnImgSVG: '', label: '', state }, element);
}
