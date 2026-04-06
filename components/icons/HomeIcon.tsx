import React from 'react';

const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
    <path d="M12 5.432l8.159 8.159c.026.026.05.054.07.084v6.101A2.25 2.25 0 0117.75 22h-3.5a.75.75 0 01-.75-.75V15.5h-2.5V21.25a.75.75 0 01-.75.75h-3.5A2.25 2.25 0 013.75 19.75v-6.101a1.25 1.25 0 01.07-.084L12 5.432z" />
  </svg>
);

export default HomeIcon;
