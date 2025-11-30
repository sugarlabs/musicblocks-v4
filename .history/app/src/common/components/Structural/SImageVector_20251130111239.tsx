import React from 'react';
import styles from './SImageVector.module.scss';

type Props = {
  content: string;
  className?: string;
  alt?: string;
};

const SImageVector: React.FC<Props> = ({ content, className, alt }) => {
  if (content.trim().startsWith('<svg')) {
    return (
      <span
        className={`${styles.vector} ${className || ''}`}
        role="img"
        aria-label={alt}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return <img src={content} alt={alt || 'svg'} className={`${styles.vector} ${className || ''}`} />;
};

export default SImageVector;
