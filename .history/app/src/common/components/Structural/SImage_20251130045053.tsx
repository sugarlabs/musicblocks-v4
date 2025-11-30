import React from 'react';

export type TAsset = {
  src: string;
  alt?: string;
};

type SImageProps = {
  content: TAsset;
  className?: string;
};

const SImage: React.FC<SImageProps> = ({ content, className }) => {
  return <img src={content.src} alt={content.alt || ''} className={className} />;
};

export default SImage;
