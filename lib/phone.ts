import { COUNTRY_CODES } from './countries';
import { CountryDetection, PhoneValidation } from './types';

export function detectCountryFromPhoneNumber(phoneNumber: string): CountryDetection | null {
  let cleanNumber = phoneNumber.replace(/\D/g, '');
  if (!cleanNumber) return null;

  const sortedCodes = Object.keys(COUNTRY_CODES).sort((a, b) => b.length - a.length);

  for (const code of sortedCodes) {
    if (cleanNumber.startsWith(code)) {
      const country = COUNTRY_CODES[code];
      const nationalNumber = cleanNumber.substring(code.length);

      if (nationalNumber.length >= 3 && nationalNumber.length <= (country.maxLength || 15)) {
        return {
          countryCode: code,
          countryInfo: country,
          nationalNumber: nationalNumber,
          fullNumber: cleanNumber,
          e164: `+${cleanNumber}`,
          isComplete: nationalNumber.length >= 7
        };
      }
    }
  }
  return null;
}

export function normalizeToE164(phoneNumber: string): PhoneValidation {
  if (!phoneNumber) {
    return { valid: false, error: 'Phone number is required' };
  }

  const detection = detectCountryFromPhoneNumber(phoneNumber);
  if (!detection) {
    return { valid: false, error: 'Unable to detect country. Please include country code (e.g., 919876543210)' };
  }

  const { countryCode, countryInfo, nationalNumber, e164 } = detection;

  if (nationalNumber.length < 6) {
    return { valid: false, error: 'Phone number too short' };
  }

  if (nationalNumber.length > 15) {
    return { valid: false, error: 'Phone number too long' };
  }

  if (countryInfo.maxLength && nationalNumber.length > countryInfo.maxLength) {
    return { valid: false, error: `Phone number too long for ${countryInfo.name}` };
  }

  return { 
    valid: true, 
    e164, 
    countryCode, 
    nationalNumber,
    country: countryInfo.name,
    detectedCountry: `${countryInfo.flag} ${countryInfo.name} (+${countryCode})`
  };
}

export function formatPhoneNumber(number: string): string {
  return number.trim().replace(/\D/g, '');
}

export function validatePhoneNumber(number: string): boolean {
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(number.trim());
}