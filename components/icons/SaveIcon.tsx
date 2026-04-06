
import React from 'react';

const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 3H6.75A1.5 1.5 0 0 0 5.25 4.5v15A1.5 1.5 0 0 0 6.75 21h10.5A1.5 1.5 0 0 0 18.75 19.5V6.75L17.25 3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3v6h9V3M7.5 13.5h9v7.5h-9v-7.5Z" />
  </svg>
);

export default SaveIcon;