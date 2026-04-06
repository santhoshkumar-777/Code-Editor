
import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!show) return null;

  return (
    <div
      className={`fixed bottom-5 right-5 bg-surface text-text px-4 py-2 rounded-md shadow-lg transition-transform transform border border-border ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      style={{ transitionDuration: '300ms' }}
    >
      {message}
    </div>
  );
};

export default Toast;