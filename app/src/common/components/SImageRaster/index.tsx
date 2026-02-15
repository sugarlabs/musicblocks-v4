import React from 'react';

// Define the props interface as required by the tech stack
interface SImageRasterProps {
  content: string; // Raster content data URL string
  alt?: string;
  className?: string;
}

const SImageRaster: React.FC<SImageRasterProps> = ({ content, alt = "", className = "" }) => {
  return (
    <img 
      src={content} 
      alt={alt} 
      className={`s-image-raster ${className}`} 
    />
  );
};

export { SImageRaster };
