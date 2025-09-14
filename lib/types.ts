export interface CountryInfo {
  flag: string;
  name: string;
  maxLength: number;
}

export interface CountryDetection {
  countryCode: string;
  countryInfo: CountryInfo;
  nationalNumber: string;
  fullNumber: string;
  e164: string;
  isComplete: boolean;
}

export interface PhoneValidation {
  valid: boolean;
  error?: string;
  e164?: string;
  countryCode?: string;
  nationalNumber?: string;
  country?: string;
  detectedCountry?: string;
}

export interface Session {
  id: string;
  number: string;
  status: string;
  lastSeen?: string;
  platform?: string;
  user?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface BannedUser {
  number: string;
  blockedAt?: string;
}

export interface PairingResponse {
  code?: string;
  pairCode?: string;
  qr?: string;
  link?: string;
  message?: string;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';