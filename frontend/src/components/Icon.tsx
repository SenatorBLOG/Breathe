// src/components/Icon.tsx
import React from 'react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  alt?: string;
}

export default function Icon({ name, size = 20, className, alt = '' }: IconProps) {
  return (
    <img
      src={`/icons/${name}.webp`}
      width={size}
      height={size}
      alt={alt}
      className={className}
    />
  );
}
