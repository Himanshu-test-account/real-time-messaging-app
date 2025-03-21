// src/components/Common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ fullScreen = false }) => {
  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? 'absolute inset-0 bg-gray-50 bg-opacity-50' : ''
      }`}
    >
      <svg
        className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary-600"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          d="M4 12a8 8 0 1 1 16 0A8 8 0 0 1 4 12z"
        />
      </svg>
    </div>
  );
};

export default LoadingSpinner;
