import { useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Notification({ message, type, onClose, duration = 3000 }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className={`w-3 h-3 rounded-full ${typeColors[type]}`}></div>
          <p className="text-gray-700 font-semibold text-lg">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
} 