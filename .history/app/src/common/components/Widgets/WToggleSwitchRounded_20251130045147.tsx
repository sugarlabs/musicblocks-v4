import React from 'react';

type WToggleSwitchRoundedProps = {
  active: boolean;
  clickHandler: () => void;
};

const WToggleSwitchRounded: React.FC<WToggleSwitchRoundedProps> = ({ active, clickHandler }) => {
  return (
    <div
      onClick={clickHandler}
      style={{
        width: 50,
        height: 26,
        borderRadius: 26,
        background: active ? '#2196f3' : '#bbb',
        padding: 3,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        transition: '0.2s',
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          transform: active ? 'translateX(24px)' : 'translateX(0)',
          transition: '0.2s',
        }}
      />
    </div>
  );
};

export default WToggleSwitchRounded;
