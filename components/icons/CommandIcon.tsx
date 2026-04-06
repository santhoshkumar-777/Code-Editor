import React from 'react';

const CommandIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M4.5 5.25A.75.75 0 015.25 4.5h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zm0 4.5A.75.75 0 015.25 9h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zm0 4.5A.75.75 0 015.25 13.5h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zm0 4.5A.75.75 0 015.25 18h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75z"
      clipRule="evenodd"
    />
  </svg>
);

export default CommandIcon;
