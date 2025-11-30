import React from 'react';
import { SImage } from '../../components';

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
  const buttonSize = size === 'big' ? 50 : 30;

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
