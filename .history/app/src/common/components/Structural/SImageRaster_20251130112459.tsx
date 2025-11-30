import React from 'react';
import styles from './SImageRaster.module.scss';

type Props = {
  content: string;
  className?: string;
  alt?: string;
};

const SImageRaster: React.FC<Props> = ({ content, className, alt }) => {
  return (
    <img src={content} alt={alt || 'image'} className={`${styles.raster} ${className || ''}`} />
  );
};

export default SImageRaster;
