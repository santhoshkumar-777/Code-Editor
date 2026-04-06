import React from 'react';

const SidebarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
        d="M21 3H3v18h18V3zM9 19H5V5h4v14zm10 0h-8V5h8v14z"
    />
  </svg>
);

export default SidebarIcon;