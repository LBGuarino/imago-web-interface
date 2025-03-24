import { MedicalAppError } from "@/config/security";

export interface ApiError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  isUserFacing: boolean;
}

export const handleApiError = (error: any): ApiError => {
  // Error de red
  if (!error.response) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Error de conexión. Por favor, verifica tu conexión a internet.',
      severity: 'medium',
      isUserFacing: true
    };
  }

  // Error de autenticación
  if (error.response.status === 401) {
    return {
      code: 'UNAUTHORIZED',
      message: 'Sesión expirada. Por favor, vuelve a iniciar sesión.',
      severity: 'high',
      isUserFacing: true
    };
  }

  // Error de permisos
  if (error.response.status === 403) {
    return {
      code: 'FORBIDDEN',
      message: 'No tienes permisos para realizar esta acción.',
      severity: 'high',
      isUserFacing: true
    };
  }

  // Error de validación
  if (error.response.status === 422) {
    return {
      code: 'VALIDATION_ERROR',
      message: error.response.data.message || 'Error de validación en los datos.',
      severity: 'low',
      isUserFacing: true
    };
  }

  // Error del servidor
  if (error.response.status >= 500) {
    return {
      code: 'SERVER_ERROR',
      message: 'Error interno del servidor. Por favor, intenta más tarde.',
      severity: 'high',
      isUserFacing: true
    };
  }

  // Error personalizado del backend
  if (error.response.data?.error) {
    return {
      code: error.response.data.code || 'UNKNOWN_ERROR',
      message: error.response.data.error,
      severity: error.response.data.severity || 'medium',
      isUserFacing: error.response.data.isUserFacing ?? true
    };
  }

  // Error genérico
  return {
    code: 'UNKNOWN_ERROR',
    message: 'Ha ocurrido un error inesperado.',
    severity: 'medium',
    isUserFacing: true
  };
};

export const logError = (error: ApiError, context: string) => {
  console.error(`[${context}] Error:`, {
    code: error.code,
    message: error.message,
    severity: error.severity,
    timestamp: new Date().toISOString()
  });

  // Aquí podrías agregar integración con servicios de logging como Sentry
  // if (error.severity === 'high') {
  //   Sentry.captureException(error);
  // }
}; 