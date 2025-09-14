'use client';

import { useState, useRef, useEffect } from 'react';
import { useCountryDetection } from '../hooks/useCountryDetection';
import { useApi } from '../hooks/useApi';

interface PairFormProps {
  onSuccess?: (number: string) => void;
  showToast?: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function PairForm({ onSuccess, showToast }: PairFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { post } = useApi();
  
  const {
    phoneNumber,
    detectedCountry,
    validation,
    isFocused,
    setIsFocused,
    updatePhoneNumber,
    resetDetection,
    hasCountry,
    isComplete,
    validationError
  } = useCountryDetection();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePhoneNumber(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validation.valid) {
      showToast?.('Invalid Number', validationError || 'Please enter a valid phone number', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await post('/api/pair', { number: phoneNumber });

      if (response.success) {
        showToast?.('Success', 'Phone number paired successfully!', 'success');
        resetDetection();
        onSuccess?.(phoneNumber);
      } else {
        showToast?.('Pairing Failed', response.error || 'Failed to pair phone number', 'error');
      }
    } catch (error) {
      showToast?.('Network Error', 'Failed to connect to server', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card action-card">
      <div className="card-header">
        <i className="fas fa-plus-circle card-icon"></i>
        <h2>Pair New Number</h2>
      </div>
      <div className="card-content">
        <form onSubmit={handleSubmit} className="action-form">
          <div className="form-group">
            <label htmlFor="pairNumber">Phone Number</label>
            <div 
              className={`input-wrapper ${isFocused ? 'focused' : ''} ${hasCountry ? 'has-country-code' : ''} ${phoneNumber ? 'has-value' : ''} ${isComplete ? 'number-complete' : ''}`}
            >
              <i className="fas fa-phone input-icon"></i>
              <input
                ref={inputRef}
                type="tel"
                id="pairNumber"
                value={phoneNumber}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Enter number (e.g., 919876543210)"
                required
                inputMode="numeric"
                autoComplete="tel"
                pattern="^[\d\s-]{10,18}$"
                title="Enter phone number with country code"
              />
              
              {detectedCountry && (
                <div className={`country-code-display ${hasCountry ? 'show' : ''} ${isComplete ? 'complete' : 'detected'} ${isFocused ? 'focused' : ''}`}>
                  <div className="country-badge">
                    <span className="country-flag">{detectedCountry.countryInfo.flag}</span>
                    <span className="country-code">+{detectedCountry.countryCode}</span>
                  </div>
                </div>
              )}
            </div>
            <small className="form-help">
              Enter your phone number with country code (e.g., 919876543210). Country will be auto-detected.
            </small>
            {validationError && (
              <div className="error-message">
                {validationError}
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting || !validation.valid}
          >
            <span className="btn-text">
              {isSubmitting ? 'Pairing...' : 'Pair Number'}
            </span>
            {isSubmitting && (
              <div className="btn-loader">
                <i className="fas fa-spinner fa-spin"></i>
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}