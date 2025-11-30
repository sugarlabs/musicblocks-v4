import React from 'react';
import SImage, { TAsset } from '../Structural/SImage';
import styles from './WIconButton.module.scss';

type WIconButtonProps = {
  size: 'big' | 'small';
  asset: TAsset;
  handlerClick: () => void;
};

const WIconButton: React.FC<WIconButtonProps> = ({ size, asset, handlerClick }) => {
  return (
    <button onClick={handlerClick} className={styles['w-icon-button']}>
      <SImage
        content={asset}
        className={size === 'big' ? styles['w-icon-big'] : styles['w-icon-small']}
      />
    </button>
  );
};

export default WIconButton;
