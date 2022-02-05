// -- stylesheet -----------------------------------------------------------------------------------

import './Toolbar.scss';

// -- component definition -------------------------------------------------------------------------

/**
 * Toolbar component.
 * @param props - React props (title)
 * @returns root JSX element of the Toolbar component
 */
export default function (): JSX.Element {
  return (
    <div id="toolbar-wrapper">
      <section id="toolbar">
        <div className="toolbar-cluster" id="toolbar-cluster-a"></div>
        <div className="toolbar-cluster" id="toolbar-cluster-b"></div>
      </section>
      <section className="toolbar-extended toolbar-extended-hidden" id="toolbar-float">
        <div className="toolbar-extended-head" id="toolbar-float-head">
          <h3 className="toolbar-extended-head-title" id="toolbar-float-title">
            Header
          </h3>
          <button className="toolbar-extended-head-btn" id="toolbar-float-btn-pin">
            Pin
          </button>
        </div>
        <div className="toolbar-extended-content" id="toolbar-float-content"></div>
      </section>
      <section className="toolbar-extended toolbar-extended-hidden" id="toolbar-pinned">
        <div className="toolbar-extended-head" id="toolbar-pinned-head">
          <h3 className="toolbar-extended-head-title" id="toolbar-pinned-title">
            Header
          </h3>
          <button className="toolbar-extended-head-btn" id="toolbar-pinned-btn-unpin">
            Unpin
          </button>
        </div>
        <div className="toolbar-extended-content" id="toolbar-pinned-content"></div>
      </section>
    </div>
  );
}

/**
 * Mounts Extended Toolbar subcomponent.
 * @param title title of the Extended Toolbar
 * @param type `float` or `pinned` Extended Toolbar
 * @param hooks external callbacks to hook on to component's actions
 * @returns DOM element of the Extended Toolbar's content container
 */
export function setToolbarExtended(
  title: string,
  type: 'float' | 'pinned',
  hooks: {
    pin: CallableFunction;
    unpin: CallableFunction;
  },
): HTMLDivElement {
  const float = document.getElementById('toolbar-float')!;
  const pinned = document.getElementById('toolbar-pinned')!;

  const _btnFloatPin = float.children[0].children[1] as HTMLButtonElement;
  const btnFloatPin = _btnFloatPin.cloneNode(true);
  _btnFloatPin.parentNode!.replaceChild(btnFloatPin, _btnFloatPin);

  const _btnPinnedUnpin = pinned.children[0].children[1] as HTMLButtonElement;
  const btnPinnedUnpin = _btnPinnedUnpin.cloneNode(true);
  _btnPinnedUnpin.parentNode!.replaceChild(btnPinnedUnpin, _btnPinnedUnpin);

  float.classList.remove('toolbar-extended-hidden');
  pinned.classList.remove('toolbar-extended-hidden');

  if (type === 'float') {
    pinned.classList.add('toolbar-extended-hidden');
    float.classList.remove('toolbar-extended-hidden');
  } else {
    float.classList.add('toolbar-extended-hidden');
    pinned.classList.remove('toolbar-extended-hidden');
  }

  btnFloatPin.addEventListener('click', () => {
    float.classList.add('toolbar-extended-hidden');
    pinned.classList.remove('toolbar-extended-hidden');

    hooks.pin();
  });
  btnPinnedUnpin.addEventListener('click', () => {
    pinned.classList.add('toolbar-extended-hidden');
    float.classList.remove('toolbar-extended-hidden');

    hooks.unpin();
  });

  const toolbar = type === 'float' ? float : pinned;

  const headTitle = toolbar.children[0].children[0] as HTMLHeadingElement;
  headTitle.innerHTML = title;

  return toolbar.children[1] as HTMLDivElement;
}

export function unsetToolbarExtended(): void {
  const float = document.getElementById('toolbar-float')!;
  const pinned = document.getElementById('toolbar-pinned')!;

  const _btnFloatPin = float.children[0].children[1] as HTMLButtonElement;
  const btnFloatPin = _btnFloatPin.cloneNode(true);
  _btnFloatPin.parentNode!.replaceChild(btnFloatPin, _btnFloatPin);

  const _btnPinnedUnpin = pinned.children[0].children[1] as HTMLButtonElement;
  const btnPinnedUnpin = _btnPinnedUnpin.cloneNode(true);
  _btnPinnedUnpin.parentNode!.replaceChild(btnPinnedUnpin, _btnPinnedUnpin);

  float.classList.add('toolbar-extended-hidden');
  pinned.classList.add('toolbar-extended-hidden');
}
