import React from 'react';
import styles from './WToggleSwitchRounded.module.scss';

type WToggleSwitchRoundedProps = {
  active: boolean;
  clickHandler: () => void;
};

const WToggleSwitchRounded: React.FC<WToggleSwitchRoundedProps> = ({ active, clickHandler }) => {
  return (
    <div
      className={`${styles['w-toggle-rounded']} ${active ? styles['w-toggle-rounded--active'] : ''}`}
      onClick={clickHandler}
    >
      <div className={styles['w-toggle-rounded__thumb']} />
    </div>
  );
};

export default WToggleSwitchRounded;
