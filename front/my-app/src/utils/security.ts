import CryptoJS from 'crypto-js';
import { MedicalUserData, SecurityLog } from '@/config/security';

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'your-secure-key';

export function encryptData(data: any): string {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
}

export function decryptData(encryptedData: string): any {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

export function validateMedicalUserData(data: any): MedicalUserData {
  if (!data || typeof data !== 'object') {
    throw new Error('Datos de usuario inválidos');
  }
  
  // Validar campos requeridos
  const requiredFields = ['email', 'approved', 'admin', 'email_verified', 'uid'];
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Campo requerido faltante: ${field}`);
    }
  }
  
  // Validar tipos de datos
  if (typeof data.email !== 'string' || !data.email.includes('@')) {
    throw new Error('Email inválido');
  }
  
  return data as MedicalUserData;
}

export function verifyDataIntegrity(data: any): boolean {
  try {
    // Verificar estructura de datos
    if (!data || typeof data !== 'object') return false;
    
    // Verificar campos críticos
    const criticalFields = ['uid', 'email', 'approved'];
    for (const field of criticalFields) {
      if (!(field in data)) return false;
    }
    
    // Verificar tipos de datos
    if (typeof data.uid !== 'string' || data.uid.length === 0) return false;
    if (typeof data.email !== 'string' || !data.email.includes('@')) return false;
    if (typeof data.approved !== 'boolean') return false;
    
    return true;
  } catch (error) {
    console.error('Error en verificación de integridad:', error);
    return false;
  }
}

export function logSecurityEvent(event: string, details: any) {
  const log: SecurityLog = {
    timestamp: new Date(),
    event,
    userId: typeof window !== 'undefined' ? window.location.hostname : undefined,
    ipAddress: typeof window !== 'undefined' ? window.location.hostname : undefined,
    details
  };
  
  // Enviar log al backend
  fetch('http://localhost:3001/api/security-logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(log)
  }).catch(console.error);
}

export function clearAppState() {
  localStorage.clear();
  sessionStorage.clear();
  // Limpiar cookies
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
}

export function setupSessionTimeout(onTimeout: () => void) {
  let timeoutId: NodeJS.Timeout;
  
  const resetTimeout = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(onTimeout, 30 * 60 * 1000); // 30 minutos
  };
  
  // Resetear timeout en actividad del usuario
  ['mousedown', 'keydown', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetTimeout);
  });
  
  resetTimeout();
  
  return () => {
    clearTimeout(timeoutId);
    ['mousedown', 'keydown', 'touchstart'].forEach(event => {
      document.removeEventListener(event, resetTimeout);
    });
  };
} 