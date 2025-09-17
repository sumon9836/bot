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