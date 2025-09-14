
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
  const [currentNumber, setCurrentNumber] = useState('');
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
        const pairCode = response.data?.code || response.code || response.pairCode;
        
        console.log('API Response:', response);
        console.log('Extracted pairing code:', pairCode);
        
        // Always show the modal for successful pairing - even if no code
        setPairCodeData({
          code: pairCode,
          qr: response.data?.qr || response.qr,
          link: response.data?.link || response.link
        });
        setShowPairCode(true);
        
        if (pairCode) {
          showToast?.('Success', `Pairing code: ${pairCode}`, 'success');
        } else {
          showToast?.('Success', 'Phone number paired successfully!', 'success');
        }
        
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
      {showPairCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(15px)' }}>
          <div className="w-full h-full max-w-4xl mx-auto flex flex-col justify-center items-center p-8 text-center text-white relative overflow-y-auto" style={{ background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.1), rgba(25, 25, 25, 0.2))' }}>
            
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
            {pairCodeData?.code ? (
              <div className="mb-12 p-10 bg-gradient-to-br from-emerald-500/25 to-cyan-500/25 border-2 border-emerald-400/50 rounded-3xl w-full max-w-2xl shadow-2xl" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15)), rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(20px)' }}>
                <div className="flex items-center justify-center gap-3 mb-8">
                  <i className="fas fa-key text-emerald-400 text-3xl"></i>
                  <p className="text-emerald-300 text-2xl font-bold">Your WhatsApp Pairing Code</p>
                </div>
                
                <div className="mb-10 p-8 bg-black/30 rounded-2xl border border-emerald-500/30" style={{ backdropFilter: 'blur(10px)' }}>
                  <div 
                    className="text-7xl font-mono font-black text-transparent bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text select-all tracking-[0.3em] cursor-pointer hover:from-emerald-200 hover:to-cyan-200 transition-all duration-300 transform hover:scale-110 drop-shadow-lg"
                    onClick={() => copyToClipboard(pairCodeData.code!)}
                    title="Click to copy code"
                    style={{ 
                      textShadow: '0 0 30px rgba(16, 185, 129, 0.7)',
                      filter: 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.5))'
                    }}
                  >
                    {pairCodeData.code}
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => copyToClipboard(pairCodeData.code!)}
                    className="px-10 py-5 bg-gradient-to-r from-emerald-500/40 to-cyan-500/40 border-2 border-emerald-400/50 text-emerald-200 rounded-2xl hover:from-emerald-500/50 hover:to-cyan-500/50 hover:border-emerald-300/70 transition-all duration-300 font-bold text-xl flex items-center gap-4 mx-auto transform hover:scale-105 shadow-lg"
                    style={{ backdropFilter: 'blur(10px)' }}
                  >
                    <i className="fas fa-copy text-2xl"></i>
                    Copy Pairing Code
                  </button>
                  
                  <p className="text-emerald-400/80 text-sm mt-2">Click the code above or this button to copy</p>
                </div>
              </div>
            ) : (
              <div className="mb-8 p-8 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/40 rounded-2xl w-full max-w-lg">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <i className="fas fa-exclamation-triangle text-yellow-400 text-2xl"></i>
                  <p className="text-yellow-300 text-xl font-bold">No Pairing Code Received</p>
                </div>
                <p className="text-yellow-200">The backend didn't return a pairing code. Please try again.</p>
              </div>
            )}

            {/* WhatsApp Direct Link */}
            <div className="mb-10">
              {pairCodeData?.link ? (
                <a 
                  href={pairCodeData.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-12 py-6 bg-gradient-to-r from-green-500/40 to-emerald-500/40 border-2 border-green-400/60 text-green-200 rounded-2xl hover:from-green-500/50 hover:to-emerald-500/50 hover:border-green-300/80 transition-all duration-300 font-bold text-xl transform hover:scale-105 shadow-2xl"
                  style={{ backdropFilter: 'blur(15px)' }}
                >
                  <i className="fab fa-whatsapp mr-4 text-3xl"></i>
                  Open WhatsApp Directly
                </a>
              ) : pairCodeData?.code ? (
                <a 
                  href={`https://wa.me/qr/${pairCodeData.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-12 py-6 bg-gradient-to-r from-green-500/40 to-emerald-500/40 border-2 border-green-400/60 text-green-200 rounded-2xl hover:from-green-500/50 hover:to-emerald-500/50 hover:border-green-300/80 transition-all duration-300 font-bold text-xl transform hover:scale-105 shadow-2xl"
                  style={{ backdropFilter: 'blur(15px)' }}
                >
                  <i className="fab fa-whatsapp mr-4 text-3xl"></i>
                  Open WhatsApp
                </a>
              ) : null}
            </div>

            {/* Step-by-Step Instructions */}
            <div className="mb-10 bg-gray-900/50 border border-gray-500/40 rounded-3xl p-10 w-full max-w-3xl" style={{ backdropFilter: 'blur(20px)' }}>
              <h3 className="text-3xl font-bold text-white mb-8 flex items-center justify-center gap-4">
                <i className="fas fa-list-ol text-cyan-400 text-2xl"></i>
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
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setShowPairCode(false);
                  setPairCodeData(null);
                  setCurrentNumber('');
                }}
                className="px-12 py-5 bg-gray-700/40 border-2 border-gray-500/50 text-gray-300 rounded-2xl hover:bg-gray-600/50 hover:border-gray-400/60 transition-all duration-300 font-bold text-lg transform hover:scale-105"
                style={{ backdropFilter: 'blur(10px)' }}
              >
                <i className="fas fa-times mr-3 text-xl"></i>
                Close
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={() => {
                setShowPairCode(false);
                setPairCodeData(null);
                setCurrentNumber('');
              }}
              className="absolute top-8 right-8 w-14 h-14 bg-gray-700/50 border-2 border-gray-500/50 text-gray-300 rounded-full hover:bg-gray-600/60 hover:border-gray-400/70 transition-all duration-200 flex items-center justify-center transform hover:scale-110"
              style={{ backdropFilter: 'blur(10px)' }}
            >
              <i className="fas fa-times text-2xl"></i>
            </button>
          </div>
        </div>
      )}

      
    </>
  );
}
