import type { TAsset } from '@/@types/core/assets';

// -- ui items -------------------------------------------------------------------------------------

import { SImageRaster, SImageVector } from '..';

// -- component definition -------------------------------------------------------------------------

/**
 * React component definition for a generic Image component.
 */
export default function (props: {
  /** Image asset. */
  asset: TAsset;
}): JSX.Element {
  const type = props.asset.type;

  // ---------------------------------------------------------------------------

  return (
    <>
      {type === 'image/svg+xml' && <SImageVector content={props.asset.data} />}
      {type.startsWith('image') && type !== 'image/svg+xml' && (
        <SImageRaster content={props.asset.data} />
      )}
    </>
  );
}
