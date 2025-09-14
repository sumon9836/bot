
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
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [pairCodeData, setPairCodeData] = useState<{ code?: string, qr?: string, link?: string } | null>(null);
  const [currentNumber, setCurrentNumber] = useState('');
  const [userCode, setUserCode] = useState('');
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast?.('Copied!', 'Pairing code copied to clipboard', 'success');
    } catch (err) {
      showToast?.('Failed to copy', 'Please copy the code manually', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validation.valid) {
      showToast?.('Invalid Number', validationError || 'Please enter a valid phone number', 'error');
      return;
    }

    setIsSubmitting(true);
    setCurrentNumber(phoneNumber);

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

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userCode || userCode.length < 6) {
      showToast?.('Invalid Code', 'Please enter a valid 8-character pairing code', 'error');
      return;
    }

    setIsSubmittingCode(true);

    try {
      const response = await post('/api/pair-with-code', { 
        number: currentNumber, 
        code: userCode.toUpperCase() 
      });

      if (response.success) {
        showToast?.('Success', 'Device paired successfully!', 'success');
        setShowPairCode(false);
        setShowCodeInput(false);
        setPairCodeData(null);
        setUserCode('');
        onSuccess?.(currentNumber, userCode);
      } else {
        showToast?.('Pairing Failed', response.error || 'Failed to pair device with code', 'error');
      }
    } catch (error: any) {
      showToast?.('Network Error', 'Failed to connect to server', 'error');
    } finally {
      setIsSubmittingCode(false);
    }
  };

  return (
    <>
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
                {isSubmitting ? 'Getting Pairing Code...' : 'Get Pairing Code'}
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

      {/* Full Screen WhatsApp Pairing Code Modal */}
      {showPairCode && pairCodeData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}>
          <div className="w-full h-full max-w-2xl mx-auto flex flex-col justify-center items-center p-8 text-center text-white relative">
            
            {/* Header */}
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500/50">
                <i className="fab fa-whatsapp text-4xl text-green-400"></i>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">WhatsApp Pairing</h1>
              <p className="text-xl text-gray-300">Use this code to link your device</p>
            </div>

            {/* Pairing Code Display */}
            {pairCodeData.code && (
              <div className="mb-8 p-8 bg-blue-500/10 border-2 border-blue-500/30 rounded-2xl w-full max-w-md">
                <p className="text-gray-300 text-lg mb-4">Your Pairing Code:</p>
                <div 
                  className="text-5xl font-mono font-bold text-blue-300 select-all mb-6 tracking-widest cursor-pointer hover:text-blue-200 transition-colors"
                  onClick={() => copyToClipboard(pairCodeData.code!)}
                  title="Click to copy"
                >
                  {pairCodeData.code}
                </div>
                <button
                  onClick={() => copyToClipboard(pairCodeData.code!)}
                  className="px-6 py-3 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all duration-200 font-medium flex items-center gap-2 mx-auto"
                >
                  <i className="fas fa-copy"></i>
                  Copy Code
                </button>
              </div>
            )}

            {/* WhatsApp Link */}
            {pairCodeData.link && (
              <div className="mb-8">
                <a 
                  href={pairCodeData.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-4 bg-green-500/20 border-2 border-green-500/40 text-green-300 rounded-xl hover:bg-green-500/30 transition-all duration-200 font-bold text-lg"
                >
                  <i className="fab fa-whatsapp mr-3"></i>
                  Open WhatsApp
                </a>
              </div>
            )}

            {/* Instructions */}
            <div className="mb-8 bg-gray-500/10 border border-gray-500/20 rounded-xl p-6 w-full max-w-lg">
              <h3 className="text-lg font-semibold text-white mb-4">How to pair:</h3>
              <div className="text-left space-y-2 text-gray-300">
                <p>1. Open WhatsApp on your phone</p>
                <p>2. Go to Settings → Linked Devices</p>
                <p>3. Tap "Link a Device"</p>
                <p>4. Select "Link with phone number"</p>
                <p>5. Enter the pairing code above</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowCodeInput(true)}
                className="px-8 py-3 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-all duration-200 font-medium"
              >
                I've Entered the Code
              </button>
              
              <button
                onClick={() => {
                  setShowPairCode(false);
                  setPairCodeData(null);
                }}
                className="px-8 py-3 bg-gray-500/20 border border-gray-500/30 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Input Modal */}
      {showCodeInput && (
        <div className="fixed inset-0 z-60 flex items-center justify-center backdrop-blur-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}>
          <div className="w-full h-full max-w-xl mx-auto flex flex-col justify-center items-center p-8 text-center text-white">
            
            <div className="mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center border-2 border-blue-500/30">
                <i className="fas fa-mobile-alt text-2xl text-blue-400"></i>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Confirm Pairing</h2>
              <p className="text-gray-300">Enter the same code you used in WhatsApp</p>
            </div>

            <form onSubmit={handleCodeSubmit} className="w-full max-w-sm">
              <div className="mb-6">
                <input
                  type="text"
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value.toUpperCase())}
                  placeholder="Enter 8-character code"
                  className="w-full px-6 py-4 text-2xl font-mono text-center bg-transparent border-2 border-gray-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 tracking-widest"
                  maxLength={8}
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmittingCode || userCode.length < 6}
                  className="flex-1 px-6 py-3 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all duration-200 font-medium disabled:opacity-50"
                >
                  {isSubmittingCode ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Pairing...
                    </>
                  ) : (
                    'Complete Pairing'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowCodeInput(false);
                    setUserCode('');
                  }}
                  className="px-6 py-3 bg-gray-500/20 border border-gray-500/30 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-all duration-200"
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
