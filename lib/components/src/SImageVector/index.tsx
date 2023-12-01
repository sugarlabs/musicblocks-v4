import { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

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
    const sanitizedContent = DOMPurify.sanitize(props.content);
    _wrapper.innerHTML = sanitizedContent;
  });

  // ---------------------------------------------------------------------------

  return (
    <>
      <div className="l-image l-image-vector" ref={wrapper}></div>
    </>
  );
}
