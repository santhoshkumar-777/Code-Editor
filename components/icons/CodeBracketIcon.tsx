import React from 'react';

const CodeBracketIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M10.5 4.72a.75.75 0 010 1.06L5.81 10.5l4.69 4.72a.75.75 0 11-1.06 1.06l-5.25-5.25a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0zm3 1.06a.75.75 0 011.06 0l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06L18.19 12l-4.69-4.72a.75.75 0 01-.22-.53.75.75 0 01.22-.53z"
      clipRule="evenodd"
    />
  </svg>
);

export default CodeBracketIcon;
