import { useEffect, useRef } from "react";
import { loadSVG } from './index';

function ImageSVG (prop: any): JSX.Element {
  const wrapperRef = useRef(null);
  useEffect(() => {
    loadSVG(wrapperRef.current!, prop.svgText);
  }, []);
  return (
    <div ref={wrapperRef}>
    </div>
  );
};

export default ImageSVG;