'use client';

import { useState, useRef, useEffect } from 'react';
import { useCountryDetection } from '../hooks/useCountryDetection';
import { useApi } from '../hooks/useApi';
import { useRouter } from 'next/navigation';

interface PairFormProps {
  onSuccess?: (number: string, pairCode?: string) => void;
  showToast?: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function PairForm({ onSuccess, showToast }: PairFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPairCode, setShowPairCode] = useState(false);
  const [pairCodeData, setPairCodeData] = useState<{ code?: string, qr?: string, link?: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
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
        // Show pairing code or WhatsApp link
        if (response.pairCode || response.qr || response.link) {
          setPairCodeData({
            code: response.pairCode,
            qr: response.qr,
            link: response.link
          });
          setShowPairCode(true);
        } else {
          showToast?.('Success', 'Phone number paired successfully!', 'success');
        }
        resetDetection();
        onSuccess?.(phoneNumber, response.pairCode);
      } else {
        // Handle specific error messages from backend
        if (response.error && (response.error.includes('ban') || response.error.includes('blocked'))) {
          // Redirect to full-screen blocked page for banned/blocked users
          router.push('/blocked');
        } else {
          showToast?.('Pairing Failed', response.error || 'Failed to pair phone number', 'error');
        }
      }
    } catch (error: any) {
      // Handle network errors and HTTP error responses
      if (error?.response?.status === 403) {
        // Server returned 403 Forbidden - user is blocked
        router.push('/blocked');
      } else {
        showToast?.('Network Error', 'Failed to connect to server', 'error');
      }
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

      {/* WhatsApp Pairing Code Modal */}
      {showPairCode && pairCodeData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500/30">
                <i className="fab fa-whatsapp text-2xl text-green-400"></i>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">WhatsApp Pairing</h3>
              <p className="text-gray-300 text-sm">Use the code below to pair with WhatsApp</p>
            </div>

            {pairCodeData.code && (
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-gray-300 text-sm mb-2">Pairing Code:</p>
                <div className="text-2xl font-mono font-bold text-blue-300 select-all">
                  {pairCodeData.code}
                </div>
              </div>
            )}

            {pairCodeData.link && (
              <div className="mb-6">
                <a 
                  href={pairCodeData.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full px-4 py-3 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-all duration-200 font-medium"
                >
                  <i className="fab fa-whatsapp mr-2"></i>
                  Open WhatsApp
                </a>
              </div>
            )}

            {pairCodeData.qr && (
              <div className="mb-6 p-4 bg-gray-500/10 border border-gray-500/30 rounded-lg">
                <p className="text-gray-300 text-sm mb-2">Scan QR Code:</p>
                <img 
                  src={pairCodeData.qr} 
                  alt="WhatsApp QR Code" 
                  className="mx-auto max-w-full h-auto"
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="text-xs text-gray-400 space-y-1">
                <p>1. Open WhatsApp on your phone</p>
                <p>2. Go to Settings → Linked Devices</p>
                <p>3. Tap "Link a Device" and scan the code or enter the pairing code</p>
              </div>
              
              <button
                onClick={() => {
                  setShowPairCode(false);
                  setPairCodeData(null);
                }}
                className="px-6 py-2 bg-gray-500/20 border border-gray-500/30 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}