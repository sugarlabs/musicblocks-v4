import React from 'react';

// Defining the props as per your issue description
interface WTextButtonProps {
  content: string; // The text to display
  handlerClick: () => void; // The function to run when clicked
  className?: string; // Optional custom styling
}

export const WTextButton: React.FC<WTextButtonProps> = ({
  content,
  handlerClick,
  className = '',
}) => {
  return (
    <button
      onClick={handlerClick}
      // Simple default styling + allow overrides
      className={`w-text-button ${className}`}
      style={{
        padding: '8px 16px',
        backgroundColor: '#4A90E2', // Standard Blue
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
      }}
    >
      {content}
    </button>
  );
};

export default WTextButton;
