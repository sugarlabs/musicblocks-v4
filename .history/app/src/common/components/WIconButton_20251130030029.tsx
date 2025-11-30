import React from 'react';
import SImage from './SImage'; // make sure SImage exists in the same folder

type TAsset = {
  src: string;
  alt?: string;
};

type WIconButtonProps = {
  size: 'big' | 'small';
  asset: TAsset;
  handlerClick: () => void;
};

const WIconButton: React.FC<WIconButtonProps> = ({ size, asset, handlerClick }) => {
  const buttonSize = size === 'big' ? 50 : 30; // width/height in px

  return (
    <button
      onClick={handlerClick}
      style={{
        width: buttonSize,
        height: buttonSize,
        padding: 4,
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SImage content={asset} />
    </button>
  );
};

export default WIconButton;
