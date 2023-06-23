import { useEffect, useRef } from 'react';

export default function (props: { svg: string }): JSX.Element {
  const brickWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const brickWrapper = brickWrapperRef.current!;
    brickWrapper.innerHTML = props.svg;
  }, [props.svg]);

  return <div ref={brickWrapperRef}></div>;
}
