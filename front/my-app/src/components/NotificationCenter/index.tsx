import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'processing';
  title: string;
  message: string;
  timestamp: string;
  studyId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Simulación de datos - Reemplazar con llamada real a la API
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        title: 'Estudio Procesado',
        message: 'El estudio #12345 ha sido procesado exitosamente',
        timestamp: new Date().toISOString(),
        studyId: '12345',
        status: 'completed'
      },
      {
        id: '2',
        type: 'processing',
        title: 'Procesando Estudio',
        message: 'El estudio #12346 está siendo procesado',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        studyId: '12346',
        status: 'processing'
      },
      {
        id: '3',
        type: 'warning',
        title: 'Estudio Pendiente',
        message: 'El estudio #12347 está en cola de procesamiento',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        studyId: '12347',
        status: 'pending'
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const getStatusColor = (status: Notification['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      case 'info':
        return 'ℹ';
      case 'processing':
        return '⟳';
      default:
        return '•';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center space-x-3 bg-white/90 backdrop-blur-md rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100"
      >
        <span className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {notifications.some(n => n.status === 'pending') && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              {notifications.filter(n => n.status === 'pending').length}
            </span>
          )}
        </span>
        <div className="flex flex-col items-start">
          <span className="text-gray-800 font-medium">Notificaciones</span>
          <span className="text-sm text-gray-500">
            {notifications.length} {notifications.length === 1 ? 'notificación' : 'notificaciones'}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-full bg-white rounded-xl shadow-2xl z-50 border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Centro de Notificaciones</h3>
          </div>
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No hay notificaciones nuevas
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(notification.status)} text-lg`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {format(new Date(notification.timestamp), 'PPp', { locale: es })}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {notification.message}
                      </p>
                      {notification.studyId && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ID: {notification.studyId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => {/* Implementar vista de todas las notificaciones */}}
              className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Ver todas las notificaciones
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 