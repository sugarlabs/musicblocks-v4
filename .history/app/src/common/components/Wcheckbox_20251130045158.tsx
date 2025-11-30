import React from 'react';

type WCheckboxProps = {
  active: boolean;
  clickHandler: () => void;
};

const WCheckbox: React.FC<WCheckboxProps> = ({ active, clickHandler }) => {
  return (
    <div
      onClick={clickHandler}
      style={{
        width: 20,
        height: 20,
        borderRadius: 4,
        border: '2px solid #333',
        background: active ? '#333' : '#fff',
        cursor: 'pointer',
        transition: '0.2s',
      }}
    />
  );
};

export default WCheckbox;
