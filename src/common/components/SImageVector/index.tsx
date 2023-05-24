import { useEffect, useRef } from 'react';

// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- component definition -------------------------------------------------------------------------

/**
 * React component definition for Image Vector component.
 */
export default function (props: {
  /** SVG content string. */
  content: string;
}): JSX.Element {
  const wrapper = useRef(null);

  useEffect(() => {
    const _wrapper = wrapper.current! as HTMLDivElement;
    _wrapper.innerHTML = props.content;
  });

  // ---------------------------------------------------------------------------

  return (
    <>
      <div className="l-image l-image-vector" ref={wrapper}></div>
    </>
  );
}
