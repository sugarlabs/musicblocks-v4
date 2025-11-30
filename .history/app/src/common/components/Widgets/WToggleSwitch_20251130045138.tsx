import React from 'react';

type WToggleSwitchProps = {
  active: boolean;
  clickHandler: () => void;
};

const WToggleSwitch: React.FC<WToggleSwitchProps> = ({ active, clickHandler }) => {
  return (
    <div
      onClick={clickHandler}
      style={{
        width: 40,
        height: 20,
        borderRadius: 20,
        background: active ? '#00c853' : '#ccc',
        display: 'flex',
        alignItems: 'center',
        padding: 2,
        cursor: 'pointer',
        transition: '0.2s',
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#fff',
          transform: active ? 'translateX(20px)' : 'translateX(0)',
          transition: '0.2s',
        }}
      />
    </div>
  );
};

export default WToggleSwitch;
