import React from 'react';

type WTextButtonProps = {
  content: string;
  handlerClick: () => void;
};

const WTextButton: React.FC<WTextButtonProps> = ({ content, handlerClick }) => {
  return (
    <button
      onClick={handlerClick}
      style={{
        padding: '8px 16px',
        borderRadius: 6,
        cursor: 'pointer',
        background: '#ddd',
        border: 'none',
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      {content}
    </button>
  );
};

export default WTextButton;
