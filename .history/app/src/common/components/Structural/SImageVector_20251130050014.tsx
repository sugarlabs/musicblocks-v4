import React from 'react';

type Props = {
  content: string; // SVG markup string OR URL to .svg
  className?: string;
  alt?: string;
};

const SImageVector: React.FC<Props> = ({ content, className, alt }) => {
  // If content looks like an inline SVG (starts with '<svg'), render it with dangerouslySetInnerHTML
  if (content.trim().startsWith('<svg')) {
    return (
      <span
        className={className}
        role="img"
        aria-label={alt}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Otherwise assume it's a URL to an SVG file
  return <img src={content} alt={alt || 'svg'} className={className} />;
};

export default SImageVector;
