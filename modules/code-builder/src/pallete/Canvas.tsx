interface CanvasProps {
  onDrop: (type: string, x: number, y: number) => void;
  children: React.ReactNode;
}

const Canvas: React.FC<CanvasProps> = ({ onDrop, children }) => {
  const handleMouseUp = (event: React.MouseEvent<SVGSVGElement>) => {
    const type = event.currentTarget.getAttribute('data-type');
    if (type) {
      const { clientX, clientY } = event;
      const svgRect = event.currentTarget.getBoundingClientRect();
      const x = clientX - svgRect.left;
      const y = clientY - svgRect.top;
      onDrop(type, x, y);
    }
  };

  const handleDragOver = (event: React.DragEvent<SVGSVGElement>) => {
    event.preventDefault();
  };
  return (
    <svg
      width="100%"
      height="100%"
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      style={{
        border: '1px solid black',
      }}
    >
      {children}
    </svg>
  );
};

export default Canvas;
