import React, { useEffect, useRef, useState } from 'react';

const getPalletteDimensions = () => {
  const pallete = document.getElementById('Pallete');
  if (pallete) {
    const dimensions = pallete.getBoundingClientRect();
    return dimensions;
  }
};

const getCanvasDimensions = () => {
  const canvas = document.getElementById('Canvas');
  if (canvas) {
    const dimensions = canvas.getBoundingClientRect();
    return dimensions;
  }
};

const withDraggable = (Component: React.FC<any>) => (props: any) => {
  const threshold = 50;
  const [isDragging, setIsDragging] = useState(false);
  const [originalPos, setOriginalPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseDown = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    event.preventDefault();
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (svgRect) {
      const offsetX = event.clientX - svgRect.left;
      const offsetY = event.clientY - svgRect.top;
      setIsDragging(true);
      setDragStartPos({ x: offsetX, y: offsetY });
      setOriginalPos({ x: svgRect.x, y: svgRect.y });
    }
  };

  const returnToPallete = () => {
    console.log('originalPos', originalPos);
    setPosition(originalPos);
    console.log('position', position);
  };

  const resetPositon = () => {
    console.log('dragStartPos', dragStartPos);
    setPosition(dragStartPos);
    console.log('position', position);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (isDragging && svgRef.current) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const offsetX = event.clientX - svgRect.left;
      const offsetY = event.clientY - svgRect.top;

      const deltaX = offsetX - dragStartPos.x;
      const deltaY = offsetY - dragStartPos.y;

      setPosition((prevPosition) => ({
        x: prevPosition.x + deltaX,
        y: prevPosition.y + deltaY,
      }));
    }
  };

  const handleMouseUp = (event: MouseEvent) => {
    if (isDragging) {
      const svgRect = svgRef.current?.getBoundingClientRect();
      const canvasDimensions = getCanvasDimensions();
      const palletteDimensions = getPalletteDimensions();
      if (svgRect && canvasDimensions && palletteDimensions) {
        if (
          svgRect.right > canvasDimensions.right ||
          svgRect.top < canvasDimensions.top ||
          svgRect.bottom > canvasDimensions.bottom ||
          svgRect.left < palletteDimensions.left ||
          svgRect.top < palletteDimensions.top ||
          svgRect.bottom > palletteDimensions.bottom
        ) {
          returnToPallete();
        } else if (svgRect.left < canvasDimensions.left) {
          resetPositon();
        } else {
          props.onCanvasDrop();
          svgRef.current?.removeChild(svgRef.current?.children[0]);
        }
      }
      setIsDragging(false);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      ref={svgRef}
      onMouseDown={handleMouseDown}
      transform={`translate(${position.x}, ${position.y})`}
      style={{
        width: svgRef.current?.children[0].getBoundingClientRect().width,
        height: svgRef.current?.children[0].getBoundingClientRect().height,
        position: 'absolute',
        overflow: 'hidden',
        zIndex: 100,
      }}
    >
      <Component {...props} />
    </svg>
  );
};

export default withDraggable;
