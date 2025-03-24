export const SECURITY_CONFIG = {
  maxLoginAttempts: 3,
  lockoutTime: 5 * 60 * 1000, // 5 minutos
  sessionTimeout: 30 * 60 * 1000, // 30 minutos
  tokenRefreshInterval: 5 * 60 * 1000, // 5 minutos
  requireEmailVerification: true,
  requireStrongPassword: true,
  passwordMinLength: 8,
  requireSpecialChars: true,
  requireNumbers: true,
  requireUppercase: true,
  requireLowercase: true
};

export interface MedicalUserData {
  email: string;
  approved: boolean;
  admin: boolean;
  email_verified: boolean;
  uid: string;
  displayName: string;
  lastLogin?: Date;
  sessionExpiry?: Date;
}

export interface SecurityLog {
  timestamp: Date;
  event: string;
  userId?: string;
  ipAddress?: string;
  details: any;
}

export class MedicalAppError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'low' | 'medium' | 'high',
    public isUserFacing: boolean = true
  ) {
    super(message);
    this.name = 'MedicalAppError';
  }
} 