import React from 'react';
import styles from './WCheckbox.module.scss';

type WCheckboxProps = {
  active: boolean;
  clickHandler: () => void;
};

const WCheckbox: React.FC<WCheckboxProps> = ({ active, clickHandler }) => {
  return (
    <div onClick={clickHandler} className={`${styles.checkbox} ${active ? styles.active : ''}`} />
  );
};

export default WCheckbox;
