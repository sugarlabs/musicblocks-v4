import React from 'react';
import styles from './WCheckbox.module.scss';

type WCheckboxProps = {
  active: boolean;
  clickHandler: () => void;
};

const WCheckbox: React.FC<WCheckboxProps> = ({ active, clickHandler }) => {
  return (
    <div
      className={`${styles.checkbox} ${active ? styles['checkbox--active'] : ''}`}
      onClick={clickHandler}
    >
      <div className={styles.checkbox__thumb} />
    </div>
  );
};

export default WCheckbox;
