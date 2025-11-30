import React from 'react';
import SImage, { TAsset } from '../Structural/SImage';

type WIconButtonProps = {
  size: 'big' | 'small';
  asset: TAsset;
  handlerClick: () => void;
};

const WIconButton: React.FC<WIconButtonProps> = ({ size, asset, handlerClick }) => {
  const buttonSize = size === 'big' ? 48 : 32;

  return (
    <button
      onClick={handlerClick}
      style={{
        width: buttonSize,
        height: buttonSize,
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eee',
      }}
    >
      <SImage content={asset} />
    </button>
  );
};

export default WIconButton;
