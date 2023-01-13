import { useEffect, useRef } from 'react';

import { getAsset } from '@/core/assets';

// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- component definition -------------------------------------------------------------------------

export default function (props: { identifier: string }): JSX.Element {
  const wrapper = useRef(null);
  const image = getAsset('image', props.identifier)?.data;

  useEffect(() => {
    const _wrapper = wrapper.current! as HTMLDivElement;
    _wrapper.innerHTML = image ? image : '';
  }, []);

  return (
    <>
      <div className="l-image l-image-vector" ref={wrapper}></div>
    </>
  );
}
