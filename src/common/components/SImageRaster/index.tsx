// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- component definition -------------------------------------------------------------------------

/**
 * React component definition for Image Raster component.
 */
export default function (props: {
  /** Source string as URL data. */
  content: string;
}): JSX.Element {
  // ---------------------------------------------------------------------------

  return (
    <>
      <img className="l-image l-image-raster" src={props.content} />
    </>
  );
}
