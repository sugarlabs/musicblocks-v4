import React from 'react';

type Props = {
  content: string; // data URL (data:image/...) or file URL
  className?: string;
  alt?: string;
};

const SImageRaster: React.FC<Props> = ({ content, className, alt }) => {
  return <img src={content} alt={alt || 'image'} className={className} />;
};

export default SImageRaster;
