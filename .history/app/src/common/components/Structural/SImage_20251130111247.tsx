import React from 'react';
import SImageVector from './SImageVector';
import SImageRaster from './SImageRaster';

export type TAsset =
  | { kind: 'vector'; content: string; alt?: string }
  | { kind: 'raster'; content: string; alt?: string };

type Props = {
  content: TAsset;
  className?: string; // e.g., "raster--big" / "vector--small"
};

const SImage: React.FC<Props> = ({ content, className }) => {
  if (!content) return null;

  if (content.kind === 'vector') {
    return <SImageVector content={content.content} className={className} alt={content.alt} />;
  }

  return <SImageRaster content={content.content} className={className} alt={content.alt} />;
};

export default SImage;
