import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { clearAppState } from '@/utils/security';
import { handleApiError, logError } from '@/utils/errorHandling';
import { refreshAuth } from '@/lib/auth';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Agregar timestamp para evitar caché
    config.params = {
      ...config.params,
      _t: Date.now()
    };

    // Log de la petición
    console.debug(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data,
      timestamp: new Date().toISOString()
    });

    return config;
  },
  (error: AxiosError) => {
    logError(handleApiError(error), 'Request Interceptor');
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log de la respuesta exitosa
    console.debug(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
    });

    return response;
  },
  async (error: AxiosError) => {
    const apiError = handleApiError(error);
    logError(apiError, 'Response Interceptor');

    // Manejar errores de autenticación
    if (apiError.code === 'UNAUTHORIZED') {
      try {
        // Intentar refrescar el token
        const authResult = await refreshAuth();
        if (authResult) {
          // Reintentar la petición original
          if (error.config) {
            return axiosInstance(error.config);
          }
        }
      } catch (refreshError) {
        console.error('Error al refrescar el token:', refreshError);
      }

      // Si no se pudo refrescar el token, limpiar el estado y redirigir
      clearAppState();
      window.location.href = '/login?expired=true';
    }

    // Manejar errores de permisos
    if (apiError.code === 'FORBIDDEN') {
      window.location.href = '/unauthorized';
    }

    // Manejar errores de validación
    if (apiError.code === 'VALIDATION_ERROR') {
      // Aquí podrías mostrar un toast o notificación
      console.warn('Error de validación:', apiError.message);
    }

    // Manejar errores del servidor
    if (apiError.code === 'SERVER_ERROR') {
      // Aquí podrías mostrar un mensaje de error global
      console.error('Error del servidor:', apiError.message);
    }

    return Promise.reject(apiError);
  }
);

export default axiosInstance; 