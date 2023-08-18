interface CanvasProps {
  children: React.ReactNode;
}

const Canvas: React.FC<CanvasProps> = ({ children }) => {
  return (
    <svg
      id="Canvas"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      style={{
        border: '1px solid black',
      }}
    >
      {children}
    </svg>
  );
};

export default Canvas;
