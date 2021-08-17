// -- types ----------------------------------------------------------------------------------------
import p5 from 'p5';
import React, { useEffect, useState, createRef } from 'react';

import { P5Instance, SketchProps, P5WrapperProps } from '../../@types/artboard';

export const Sketch = (sketch: P5Instance): void => {
  let underlayCanvas: p5.Element;
  let bgcolor: number;
  bgcolor = 129; // default background color

  /** This is a setup function.*/
  sketch.setup = () => {
    underlayCanvas = sketch.createCanvas(1200, 600);
    underlayCanvas.position(150, 100);
    sketch.background(bgcolor);
  };

  sketch.updateWithProps = (props: SketchProps) => {
    if (props.color) {
      bgcolor = parseInt(props.color, 10);
    }
  };

  /** This is a draw function */
  sketch.draw = () => {
    sketch.background(bgcolor);
  };
};

export const UnderlaySketch: React.FC<P5WrapperProps> = ({ sketch, children, ...props }) => {
  /** Skecth takes a P5Instance of canvas, props contains attributes such as background color, etc*/
  const underlaySketch = createRef<HTMLDivElement>();
  const [instance, setInstance] = useState<P5Instance>();
  const id = `underlay-sketch`;
  useEffect(() => {
    instance?.updateWithProps?.(props);
  }, [props]);

  useEffect(() => {
    if (underlaySketch.current === null) return;
    instance?.remove();
    const canvas = new p5(Sketch, document.getElementById(id) as HTMLElement) as P5Instance;
    canvas.updateWithProps?.(props);
    setInstance(canvas);
  }, [sketch, underlaySketch.current]);

  return (
    <div style={{ position: 'absolute' }} id={id} ref={underlaySketch}>
      {children}
    </div>
  );
};
