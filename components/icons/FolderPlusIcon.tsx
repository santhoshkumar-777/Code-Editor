
import React from 'react';

const FolderPlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M2.25 4.5A.75.75 0 013 3.75h3.812a.75.75 0 01.58.32l1.264 1.58A.75.75 0 009.24 6H15a.75.75 0 01.75.75v1.5H7.5a.75.75 0 00-.75.75v8.25a.75.75 0 00.75.75h12a.75.75 0 00.75-.75v-8.25a.75.75 0 00-.75-.75h-1.5V6.75A2.25 2.25 0 0015 4.5H9.24a2.25 2.25 0 01-1.74-1.002L6.236 2.02A2.25 2.25 0 004.488 1.5H3A2.25 2.25 0 00.75 3.75v16.5A2.25 2.25 0 003 22.5h18A2.25 2.25 0 0023.25 20.25V8.25A2.25 2.25 0 0021 6H15.75V5.25a.75.75 0 00-.75-.75H9.24l-1.264-1.58A.75.75 0 007.4 2.25H3a.75.75 0 00-.75.75v.75H15a2.25 2.25 0 012.25 2.25v1.5h3.75a.75.75 0 01.75.75v12a.75.75 0 01-.75.75H3a.75.75 0 01-.75-.75V4.5z"
      clipRule="evenodd"
    />
     <path
      fillRule="evenodd"
      d="M12.75 12a.75.75 0 01.75.75v2.25h2.25a.75.75 0 010 1.5h-2.25v2.25a.75.75 0 01-1.5 0v-2.25H9.75a.75.75 0 010-1.5h2.25V12.75a.75.75 0 01.75-.75z"
      clipRule="evenodd"
    />
  </svg>
);

export default FolderPlusIcon;
