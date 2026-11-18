import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  inverted?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  inverted = false,
}) => {
  const dims =
    size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <svg
        viewBox="0 0 40 40"
        fill="none"
        className={dims}
        aria-hidden="true"
      >
        <rect
          width="40"
          height="40"
          rx="10"
          fill={inverted ? '#FFFFFF' : '#2563EB'}
        />
        <path
          d="M22.5 8L12.5 21.5H19.5L16.8 32L27.5 18.5H20.2L22.5 8Z"
          fill={inverted ? '#2563EB' : '#FFFFFF'}
        />
        <path
          d="M29.2 24.5C27.9 24.5 26.8 25.6 26.8 26.9C26.8 27.4 27 27.9 27.3 28.3L24.8 30.8C24.3 31.3 24.3 32.1 24.8 32.6C25.3 33.1 26.1 33.1 26.6 32.6L29.1 30.1C29.5 30.4 30 30.5 30.5 30.5C31.8 30.5 32.9 29.4 32.9 28.1C32.9 27.8 32.8 27.5 32.7 27.2L31.2 28.7L29.7 27.2L31.2 25.7C30.9 25.6 30.6 25.5 30.3 25.5H29.2V24.5Z"
          fill={inverted ? '#60A5FA' : '#93C5FD'}
        />
      </svg>
      {showText && (
        <span
          className={`font-bold tracking-tight ${
            size === 'lg' ? 'text-xl' : 'text-lg'
          } ${inverted ? 'text-white' : 'text-[#0F172A]'}`}
        >
          Fast Tech
        </span>
      )}
    </span>
  );
};
