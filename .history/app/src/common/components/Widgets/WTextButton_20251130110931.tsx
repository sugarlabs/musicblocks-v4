import React from 'react';
import styles from './WTextButton.module.scss';

type WTextButtonProps = {
  content: string;
  handlerClick: () => void;
};

const WTextButton: React.FC<WTextButtonProps> = ({ content, handlerClick }) => {
  return (
    <button onClick={handlerClick} className={styles['text-button']}>
      {content}
    </button>
  );
};

export default WTextButton;
