'use client';

import { useState, useCallback, useEffect } from 'react';
import { detectCountryFromPhoneNumber, normalizeToE164 } from '../lib/phone';
import { CountryDetection, PhoneValidation } from '../lib/types';

interface UseCountryDetectionOptions {
  onCountryDetected?: (detection: CountryDetection) => void;
  onValidationChange?: (validation: PhoneValidation) => void;
}

export function useCountryDetection(options: UseCountryDetectionOptions = {}) {
  const { onCountryDetected, onValidationChange } = options;
  const [phoneNumber, setPhoneNumber] = useState('');
  const [detectedCountry, setDetectedCountry] = useState<CountryDetection | null>(null);
  const [validation, setValidation] = useState<PhoneValidation>({ valid: false });
  const [isFocused, setIsFocused] = useState(false);

  const updatePhoneNumber = useCallback((value: string) => {
    // Clean the input - remove all non-digits
    const cleanedValue = value.replace(/\D/g, '');
    setPhoneNumber(cleanedValue);

    // Detect country
    const detection = detectCountryFromPhoneNumber(cleanedValue);
    setDetectedCountry(detection);

    // Validate phone number
    const phoneValidation = normalizeToE164(cleanedValue);
    setValidation(phoneValidation);

    // Call callbacks
    if (detection) {
      onCountryDetected?.(detection);
    }
    onValidationChange?.(phoneValidation);
  }, [onCountryDetected, onValidationChange]);

  const resetDetection = useCallback(() => {
    setPhoneNumber('');
    setDetectedCountry(null);
    setValidation({ valid: false });
  }, []);

  const getDisplayValue = useCallback(() => {
    return phoneNumber;
  }, [phoneNumber]);

  const getFormattedNumber = useCallback(() => {
    if (detectedCountry) {
      return `+${detectedCountry.countryCode} ${detectedCountry.nationalNumber}`;
    }
    return phoneNumber;
  }, [phoneNumber, detectedCountry]);

  const isComplete = useCallback(() => {
    return validation.valid && detectedCountry?.isComplete === true;
  }, [validation.valid, detectedCountry]);

  const hasCountry = useCallback(() => {
    return detectedCountry !== null;
  }, [detectedCountry]);

  const getValidationError = useCallback(() => {
    return validation.error;
  }, [validation.error]);

  return {
    phoneNumber,
    detectedCountry,
    validation,
    isFocused,
    setIsFocused,
    updatePhoneNumber,
    resetDetection,
    getDisplayValue,
    getFormattedNumber,
    isComplete: isComplete(),
    hasCountry: hasCountry(),
    validationError: getValidationError()
  };
}
'use client';

import { useState, useEffect } from 'react';

interface Country {
  name: string;
  code: string;
  flag: string;
  dialCode: string;
}

const countries: Country[] = [
  { name: 'United States', code: '+1', flag: '🇺🇸', dialCode: '1' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧', dialCode: '44' },
  { name: 'Bangladesh', code: '+880', flag: '🇧🇩', dialCode: '880' },
  { name: 'India', code: '+91', flag: '🇮🇳', dialCode: '91' },
  { name: 'Pakistan', code: '+92', flag: '🇵🇰', dialCode: '92' },
  // Add more countries as needed
];

export function useCountryDetection(phoneNumber: string) {
  const [detectedCountry, setDetectedCountry] = useState<Country | null>(null);

  useEffect(() => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    if (cleanNumber.length < 1) {
      setDetectedCountry(null);
      return;
    }

    // Try to detect country by prefix
    for (const country of countries) {
      if (cleanNumber.startsWith(country.dialCode)) {
        setDetectedCountry(country);
        return;
      }
    }

    setDetectedCountry(null);
  }, [phoneNumber]);

  const formatPhoneNumber = (number: string) => {
    const clean = number.replace(/[^0-9]/g, '');
    if (detectedCountry) {
      return `${detectedCountry.code}${clean.substring(detectedCountry.dialCode.length)}`;
    }
    return clean;
  };

  return {
    detectedCountry,
    formatPhoneNumber
  };
}
