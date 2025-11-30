import React from 'react';
import styles from './WToggleSwitch.module.scss';

type WToggleSwitchProps = {
  active: boolean;
  clickHandler: () => void;
};

const WToggleSwitch: React.FC<WToggleSwitchProps> = ({ active, clickHandler }) => {
  return (
    <div
      onClick={clickHandler}
      className={`${styles['toggle-switch']} ${active ? styles['toggle-switch--active'] : ''}`}
    >
      <div className={styles.toggle - switch__thumb} />
    </div>
  );
};

export default WToggleSwitch;
