import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export default function LoadingSpinner({ message, fullScreen = false, overlay = false }: LoadingSpinnerProps) {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-60"></div>
      {message && <p className="text-gray-700 font-medium">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinnerContent}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black text-white bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center">
        {spinnerContent}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-64">
      {spinnerContent}
    </div>
  );
} 