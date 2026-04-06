import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M10.788 3.212a.75.75 0 00-1.06 1.06L10.939 12l-1.211 1.212a.75.75 0 001.06 1.061l1.212-1.212 1.212 1.212a.75.75 0 001.06-1.06L13.061 12l1.212-1.212a.75.75 0 00-1.06-1.06L12 10.939l-1.212-1.212zM19.5 6.75a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zM17.25 4.5a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zM5.25 6.75a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zM3 4.5a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H3zM6.75 17.25a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zM4.5 19.5a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H4.5zM17.25 17.25a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zM19.5 19.5a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5z"
      clipRule="evenodd"
    />
  </svg>
);

export default SparklesIcon;