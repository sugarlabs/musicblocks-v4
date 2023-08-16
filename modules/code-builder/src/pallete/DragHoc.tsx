import React, { useState, useRef, useEffect } from 'react';

const withDraggable = (Component: React.FC<any>) => (props: any) => {
  const [isDragging, setIsDragging] = useState(false);
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
    }
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

  const handleMouseUp = () => {
    if (isDragging) {
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
        // width: '100px',
        // height: '100px',
        position: 'absolute',
        overflow: 'hidden',
        border: '1px solid black',
        zIndex: 100,
      }}
    >
      <Component {...props} x={position.x} y={position.y} />
    </svg>
  );
};

export default withDraggable;
