
'use client';

import { useState, useRef, useEffect } from 'react';
import { useCountryDetection } from '../hooks/useCountryDetection';
import { useApi } from '../hooks/useApi';
import { useRouter } from 'next/navigation';
import { PairingResponse } from '../lib/types';

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
      if (!text) {
        showToast?.('No code to copy', 'Pairing code is not available', 'error');
        return;
      }

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      // Add visual feedback to copy button
      const copyButton = document.querySelector('.copy-button');
      if (copyButton) {
        copyButton.classList.add('copied');
        setTimeout(() => {
          copyButton.classList.remove('copied');
        }, 600);
      }
      
      showToast?.('Copied!', 'Pairing code copied to clipboard', 'success');
    } catch (err) {
      console.error('Copy failed:', err);
      showToast?.('Failed to copy', 'Please copy the code manually: ' + text, 'error');
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
        const pairingData = response.data as PairingResponse;
        const pairCode = pairingData?.code || pairingData?.pairCode;
        
        console.log('API Response:', response);
        console.log('Extracted pairing code:', pairCode);
        
        // Always show the modal for successful pairing - even if no code
        setPairCodeData({
          code: pairCode,
          qr: pairingData?.qr,
          link: pairingData?.link
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

      {/* Enhanced Full Screen WhatsApp Pairing Code Modal */}
      {showPairCode && (
        <div className="pairing-modal-overlay">
          <div className="pairing-modal-container">
            
            

            {/* Success Message with animation */}
            <div className="success-banner">
              <div className="success-content">
                <div className="success-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="success-text">
                  <h2>Phone number paired successfully!</h2>
                  <p className="success-number">{currentNumber}</p>
                </div>
              </div>
            </div>

            {/* WhatsApp Header with pulsing logo */}
            <div className="whatsapp-header">
              <div className="whatsapp-logo">
                <i className="fab fa-whatsapp"></i>
              </div>
              <h1 className="modal-title">WhatsApp Device Pairing</h1>
              <p className="modal-subtitle">Use this code to link your device to WhatsApp</p>
            </div>

            {/* Enhanced Pairing Code Display */}
            {pairCodeData?.code ? (
              <div className="pairing-code-section">
                <div className="code-header">
                  <i className="fas fa-key"></i>
                  <span>Your WhatsApp Pairing Code</span>
                </div>
                
                <div className="code-display-container">
                  <div 
                    className="pairing-code-display"
                    onClick={() => copyToClipboard(pairCodeData.code!)}
                    title="Click to copy code"
                  >
                    {pairCodeData.code?.split('').map((char, index) => (
                      <span 
                        key={index} 
                        className="code-char"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                  
                  {/* Code glow effect */}
                  <div className="code-glow"></div>
                </div>
                
                <div className="copy-actions">
                  <button
                    onClick={() => copyToClipboard(pairCodeData.code!)}
                    className="copy-button"
                  >
                    <div className="button-content">
                      <i className="fas fa-copy"></i>
                      <span>Copy Pairing Code</span>
                    </div>
                    <div className="button-shine"></div>
                  </button>
                  
                  <p className="copy-hint">Click the code above or this button to copy</p>
                </div>
              </div>
            ) : (
              <div className="error-section">
                <div className="error-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div className="error-content">
                  <h3>No Pairing Code Received</h3>
                  <p>The backend didn't return a pairing code. Please try again.</p>
                </div>
              </div>
            )}

            

            {/* Enhanced Step-by-Step Instructions */}
            <div className="instructions-section">
              <h3 className="instructions-title">
                <i className="fas fa-list-ol"></i>
                How to Link Your Device:
              </h3>
              <div className="steps-container">
                {[
                  { icon: "fab fa-whatsapp", title: "Open WhatsApp on your phone", desc: "Make sure you have WhatsApp installed and running" },
                  { icon: "fas fa-cog", title: "Go to Settings → Linked Devices", desc: "Tap the three dots menu, then Settings, then Linked Devices" },
                  { icon: "fas fa-link", title: 'Tap "Link a Device"', desc: "You'll see options to link using QR code or phone number" },
                  { icon: "fas fa-phone", title: 'Select "Link with phone number instead"', desc: "Choose the phone number option at the bottom" },
                  { icon: "fas fa-keyboard", title: "Enter the pairing code above", desc: "Type or paste the 8-character code exactly as shown", highlight: true }
                ].map((step, index) => (
                  <div key={index} className={`step-item ${step.highlight ? 'step-highlight' : ''}`}>
                    <div className="step-number">{index + 1}</div>
                    <div className="step-content">
                      <i className={step.icon}></i>
                      <div className="step-text">
                        <h4>{step.title}</h4>
                        <p>{step.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Close Button */}
            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowPairCode(false);
                  setPairCodeData(null);
                  setCurrentNumber('');
                }}
                className="close-button"
              >
                <i className="fas fa-times"></i>
                <span>Close</span>
              </button>
            </div>

            {/* Floating close button */}
            <button
              onClick={() => {
                setShowPairCode(false);
                setPairCodeData(null);
                setCurrentNumber('');
              }}
              className="floating-close-button"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      
    </>
  );
}
