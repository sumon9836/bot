
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
        const pairCode = response.code || response.pairCode;
        
        // Always show the modal for successful pairing
        setPairCodeData({
          code: pairCode,
          qr: response.qr,
          link: response.link
        });
        setShowPairCode(true);
        
        resetDetection();
        onSuccess?.(phoneNumber, pairCode);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(10px)' }}>
          <div className="w-full h-full max-w-3xl mx-auto flex flex-col justify-center items-center p-6 text-center text-white relative overflow-y-auto">
            
            {/* Success Message */}
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/40 rounded-xl">
              <div className="flex items-center justify-center gap-3 mb-2">
                <i className="fas fa-check-circle text-green-400 text-2xl"></i>
                <h2 className="text-xl font-bold text-green-300">Phone number {currentNumber} paired successfully!</h2>
              </div>
            </div>

            {/* Header */}
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500/50 shadow-lg">
                <i className="fab fa-whatsapp text-5xl text-green-400"></i>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">WhatsApp Device Pairing</h1>
              <p className="text-xl text-gray-300">Use this code to link your device to WhatsApp</p>
            </div>

            {/* Pairing Code Display */}
            {pairCodeData.code && (
              <div className="mb-8 p-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-500/40 rounded-2xl w-full max-w-lg shadow-2xl">
                <p className="text-gray-300 text-xl mb-6 font-semibold">Your Pairing Code:</p>
                <div 
                  className="text-6xl font-mono font-black text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text select-all mb-8 tracking-widest cursor-pointer hover:from-blue-300 hover:to-purple-300 transition-all duration-300 transform hover:scale-105"
                  onClick={() => copyToClipboard(pairCodeData.code!)}
                  title="Click to copy"
                  style={{ textShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}
                >
                  {pairCodeData.code}
                </div>
                <button
                  onClick={() => copyToClipboard(pairCodeData.code!)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-500/50 text-white rounded-xl hover:from-blue-500/40 hover:to-purple-500/40 transition-all duration-300 font-bold text-lg flex items-center gap-3 mx-auto transform hover:scale-105 shadow-lg"
                >
                  <i className="fas fa-copy text-xl"></i>
                  Copy Pairing Code
                </button>
              </div>
            )}

            {/* WhatsApp Direct Link */}
            {pairCodeData.link ? (
              <div className="mb-8">
                <a 
                  href={pairCodeData.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-10 py-5 bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-2 border-green-500/50 text-green-300 rounded-2xl hover:from-green-500/40 hover:to-emerald-500/40 transition-all duration-300 font-bold text-xl transform hover:scale-105 shadow-lg"
                >
                  <i className="fab fa-whatsapp mr-4 text-2xl"></i>
                  Open WhatsApp Directly
                </a>
              </div>
            ) : (
              <div className="mb-8">
                <a 
                  href={`https://wa.me/qr/${pairCodeData.code || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-10 py-5 bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-2 border-green-500/50 text-green-300 rounded-2xl hover:from-green-500/40 hover:to-emerald-500/40 transition-all duration-300 font-bold text-xl transform hover:scale-105 shadow-lg"
                >
                  <i className="fab fa-whatsapp mr-4 text-2xl"></i>
                  Open WhatsApp
                </a>
              </div>
            )}

            {/* Step-by-Step Instructions */}
            <div className="mb-8 bg-gray-800/40 border border-gray-600/30 rounded-2xl p-8 w-full max-w-2xl backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <i className="fas fa-list-ol text-blue-400"></i>
                How to Link Your Device:
              </h3>
              <div className="grid gap-4 text-left">
                <div className="flex items-start gap-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600/20">
                  <div className="w-8 h-8 bg-blue-500/30 rounded-full flex items-center justify-center text-blue-300 font-bold text-sm flex-shrink-0">1</div>
                  <div>
                    <p className="text-white font-semibold mb-1">Open WhatsApp on your phone</p>
                    <p className="text-gray-400 text-sm">Make sure you have WhatsApp installed and running</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600/20">
                  <div className="w-8 h-8 bg-blue-500/30 rounded-full flex items-center justify-center text-blue-300 font-bold text-sm flex-shrink-0">2</div>
                  <div>
                    <p className="text-white font-semibold mb-1">Go to Settings → Linked Devices</p>
                    <p className="text-gray-400 text-sm">Tap the three dots menu, then Settings, then Linked Devices</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600/20">
                  <div className="w-8 h-8 bg-blue-500/30 rounded-full flex items-center justify-center text-blue-300 font-bold text-sm flex-shrink-0">3</div>
                  <div>
                    <p className="text-white font-semibold mb-1">Tap "Link a Device"</p>
                    <p className="text-gray-400 text-sm">You'll see options to link using QR code or phone number</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600/20">
                  <div className="w-8 h-8 bg-blue-500/30 rounded-full flex items-center justify-center text-blue-300 font-bold text-sm flex-shrink-0">4</div>
                  <div>
                    <p className="text-white font-semibold mb-1">Select "Link with phone number instead"</p>
                    <p className="text-gray-400 text-sm">Choose the phone number option at the bottom</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl border border-green-500/30">
                  <div className="w-8 h-8 bg-green-500/40 rounded-full flex items-center justify-center text-green-300 font-bold text-sm flex-shrink-0">5</div>
                  <div>
                    <p className="text-green-300 font-semibold mb-1">Enter the pairing code above</p>
                    <p className="text-green-200 text-sm">Type or paste the 8-character code exactly as shown</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setShowCodeInput(true)}
                className="px-10 py-4 bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-500/40 text-green-300 rounded-xl hover:from-green-500/40 hover:to-emerald-500/40 transition-all duration-300 font-bold text-lg transform hover:scale-105"
              >
                <i className="fas fa-check mr-3"></i>
                I've Entered the Code
              </button>
              
              <button
                onClick={() => {
                  setShowPairCode(false);
                  setPairCodeData(null);
                  setCurrentNumber('');
                }}
                className="px-10 py-4 bg-gray-600/30 border border-gray-500/40 text-gray-300 rounded-xl hover:bg-gray-600/40 transition-all duration-300 font-bold text-lg"
              >
                <i className="fas fa-times mr-3"></i>
                Cancel
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={() => {
                setShowPairCode(false);
                setPairCodeData(null);
                setCurrentNumber('');
              }}
              className="absolute top-6 right-6 w-12 h-12 bg-gray-600/40 border border-gray-500/40 text-gray-300 rounded-full hover:bg-gray-600/60 transition-all duration-200 flex items-center justify-center"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
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
