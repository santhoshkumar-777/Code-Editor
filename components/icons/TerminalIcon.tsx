import React from 'react';

const TerminalIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4 17l6-6-6-6" />
    <path d="M12 19h8" />
  </svg>
);

export default TerminalIcon;
