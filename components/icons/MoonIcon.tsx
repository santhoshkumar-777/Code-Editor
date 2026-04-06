
import React from 'react';

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 004.463-.949a.75.75 0 01.82.162a10.503 10.503 0 01-4.293 5.57a10.5 10.5 0 01-14.255-8.416a10.5 10.5 0 015.57-4.293z"
      clipRule="evenodd"
    />
  </svg>
);

export default MoonIcon;
