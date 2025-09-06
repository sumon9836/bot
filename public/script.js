// API Configuration - Using Vercel API routes  
const API_BASE_URL = '/api';

// DOM Elements
const pairForm = document.getElementById('pairForm');
const pairNumberInput = document.getElementById('pairNumber');
const refreshBtn = document.getElementById('refreshBtn');
const sessionsGrid = document.getElementById('sessionsGrid');
const sessionsLoader = document.getElementById('sessionsLoader');
const sessionsError = document.getElementById('sessionsError');
const sessionsEmpty = document.getElementById('sessionsEmpty');
const sessionsErrorMessage = document.getElementById('sessionsErrorMessage');
const retrySessionsBtn = document.getElementById('retrySessionsBtn');
const sessionCount = document.getElementById('sessionCount');
const toast = document.getElementById('toast');

// Application State
let sessions = [];
let isLoading = false;

// Utility Functions
function validatePhoneNumber(number) {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(number.trim());
}

function formatPhoneNumber(number) {
    return number.trim().replace(/\D/g, '');
}

function showToast(title, message, type = 'success') {
    const toastIcon = toast.querySelector('.toast-icon');
    const toastTitle = toast.querySelector('.toast-title');
    const toastText = toast.querySelector('.toast-text');
    
    // Reset classes
    toastIcon.className = `toast-icon ${type}`;
    toast.className = `toast ${type}`;
    
    // Set content
    toastTitle.textContent = title;
    toastText.textContent = message;
    
    // Set appropriate icon
    const icon = toastIcon.querySelector('i');
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

function showPairingCodeModal(number, code) {
    // Remove any existing modal
    const existingModal = document.getElementById('pairingModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal HTML
    const modal = document.createElement('div');
    modal.id = 'pairingModal';
    modal.className = 'pairing-modal-overlay';
    modal.innerHTML = `
        <div class="pairing-modal">
            <div class="pairing-modal-header">
                <h2><i class="fab fa-whatsapp"></i> WhatsApp Pairing Code</h2>
                <button class="modal-close" onclick="closePairingModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="pairing-modal-content">
                <div class="pairing-number-card">
                    <div class="phone-icon-wrapper">
                        <i class="fas fa-mobile-alt"></i>
                    </div>
                    <div class="number-text">
                        <span class="label">Phone Number</span>
                        <span class="number">+${number}</span>
                    </div>
                </div>
                
                <div class="pairing-code-section">
                    <div class="code-header">
                        <div class="whatsapp-icon">
                            <i class="fab fa-whatsapp"></i>
                        </div>
                        <h3>Your Pairing Code</h3>
                    </div>
                    
                    <div class="code-display-card">
                        <div class="code-wrapper">
                            <div class="pairing-code-enhanced" id="pairingCode">${code}</div>
                            <div class="code-animation-bg"></div>
                        </div>
                        <button class="copy-btn-enhanced" onclick="copyPairingCodeEnhanced('${code}')">
                            <span class="copy-icon">
                                <i class="fas fa-copy"></i>
                            </span>
                            <span class="copy-text">Copy Code</span>
                            <span class="copied-text">Copied!</span>
                        </button>
                    </div>
                </div>
                
                <div class="instructions-enhanced">
                    <div class="instruction-header">
                        <i class="fas fa-list-ol"></i>
                        <h3>How to Link Your Device</h3>
                    </div>
                    <div class="steps-container">
                        <div class="step-item">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <i class="fab fa-whatsapp step-icon"></i>
                                <span>Open WhatsApp on your phone</span>
                            </div>
                        </div>
                        <div class="step-item">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <i class="fas fa-cog step-icon"></i>
                                <span>Go to <strong>Settings → Linked Devices</strong></span>
                            </div>
                        </div>
                        <div class="step-item">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <i class="fas fa-link step-icon"></i>
                                <span>Tap <strong>"Link a Device"</strong></span>
                            </div>
                        </div>
                        <div class="step-item">
                            <div class="step-number">4</div>
                            <div class="step-content">
                                <i class="fas fa-phone step-icon"></i>
                                <span>Select <strong>"Link with phone number"</strong></span>
                            </div>
                        </div>
                        <div class="step-item">
                            <div class="step-number">5</div>
                            <div class="step-content">
                                <i class="fas fa-keyboard step-icon"></i>
                                <span>Enter the <strong>pairing code</strong> above</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="pairing-modal-footer">
                <button class="btn btn-primary" onclick="closePairingModal()">
                    Got it!
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Auto refresh sessions after pairing attempt
    setTimeout(async () => {
        await loadSessions();
    }, 5000);
}

// Global functions for modal
window.closePairingModal = function() {
    const modal = document.getElementById('pairingModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    // Reload sessions when modal is closed
    loadSessions();
};

window.copyPairingCodeEnhanced = function(code) {
    const copyBtn = document.querySelector('.copy-btn-enhanced');
    const copyIcon = copyBtn.querySelector('.copy-icon');
    const copyText = copyBtn.querySelector('.copy-text');
    const copiedText = copyBtn.querySelector('.copied-text');
    
    // Add beautiful copying animation
    copyBtn.classList.add('copying');
    copyIcon.style.transform = 'scale(0.7) rotate(360deg)';
    copyIcon.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    
    // Add sparkle effect to button
    const sparkle = document.createElement('div');
    sparkle.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 4px;
        height: 4px;
        background: white;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: sparkleEffect 0.6s ease-out;
        pointer-events: none;
    `;
    copyBtn.appendChild(sparkle);
    
    navigator.clipboard.writeText(code).then(() => {
        // Beautiful success animation
        setTimeout(() => {
            copyBtn.classList.remove('copying');
            copyBtn.classList.add('copied');
            copyIcon.innerHTML = '<i class="fas fa-check"></i>';
            copyIcon.style.transform = 'scale(1.3) rotate(0deg)';
            
            // Add bounce effect to the code
            const codeElement = document.getElementById('pairingCode');
            codeElement.classList.add('code-copied');
            codeElement.style.animation = 'bounceSuccess 0.8s ease-out';
            
            // Create floating success particles
            for (let i = 0; i < 3; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: absolute;
                    top: ${20 + i * 10}%;
                    left: ${40 + i * 20}%;
                    width: 6px;
                    height: 6px;
                    background: #FF69B4;
                    border-radius: 50%;
                    animation: floatUp 1s ease-out ${i * 0.1}s;
                    pointer-events: none;
                `;
                copyBtn.appendChild(particle);
                setTimeout(() => particle.remove(), 1000);
            }
            
            // Reset after animation
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyIcon.innerHTML = '<i class="fas fa-copy"></i>';
                copyIcon.style.transform = 'scale(1)';
                codeElement.classList.remove('code-copied');
                codeElement.style.animation = '';
            }, 2500);
        }, 400);
        
        // Remove sparkle
        setTimeout(() => sparkle.remove(), 600);
    }).catch(() => {
        // Fallback with same beautiful animation
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        setTimeout(() => {
            copyBtn.classList.remove('copying');
            copyBtn.classList.add('copied');
            copyIcon.innerHTML = '<i class="fas fa-check"></i>';
            copyIcon.style.transform = 'scale(1.3)';
            
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyIcon.innerHTML = '<i class="fas fa-copy"></i>';
                copyIcon.style.transform = 'scale(1)';
            }, 2500);
        }, 400);
        
        setTimeout(() => sparkle.remove(), 600);
    });
};

// Keep the old function for compatibility
window.copyPairingCode = window.copyPairingCodeEnhanced;

function setButtonLoading(button, loading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    if (loading) {
        btnText.style.opacity = '0';
        btnLoader.style.display = 'flex';
        button.disabled = true;
    } else {
        btnText.style.opacity = '1';
        btnLoader.style.display = 'none';
        button.disabled = false;
    }
}

// API Functions
async function makeApiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return await response.text();
        }
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}

async function pairNumber(number) {
    return await makeApiRequest(`/pair?number=${encodeURIComponent(number)}`);
}


async function getSessions() {
    return await makeApiRequest('/sessions');
}

// UI Functions
function showSessionsState(state) {
    // Hide all states first
    sessionsLoader.style.display = 'none';
    sessionsError.style.display = 'none';
    sessionsEmpty.style.display = 'none';
    sessionsGrid.style.display = 'none';
    
    // Show the requested state
    switch (state) {
        case 'loading':
            sessionsLoader.style.display = 'flex';
            break;
        case 'error':
            sessionsError.style.display = 'flex';
            break;
        case 'empty':
            sessionsEmpty.style.display = 'flex';
            break;
        case 'data':
            sessionsGrid.style.display = 'grid';
            break;
    }
}

function createSessionCard(session, index) {
    // Handle different possible session data structures
    let number, status, connectedAt, deviceInfo;
    
    if (typeof session === 'object') {
        // If session is an object, extract properties
        number = session.number || session.phone || session.id || `Session ${index + 1}`;
        status = session.status || session.state || 'active';
        connectedAt = session.connectedAt || session.created || session.timestamp;
        deviceInfo = session.device || session.client || session.browser;
    } else {
        // If session is a string or number
        number = session.toString();
        status = 'active';
    }
    
    const card = document.createElement('div');
    card.className = 'session-card';
    
    // Format the connected time
    let timeText = 'Unknown';
    if (connectedAt) {
        try {
            const date = new Date(connectedAt);
            if (!isNaN(date.getTime())) {
                timeText = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            }
        } catch (e) {
            timeText = connectedAt.toString();
        }
    }
    
    card.innerHTML = `
        <div class="session-header">
            <div class="session-number">
                <i class="fas fa-phone"></i>
                +${number}
            </div>
            <div class="session-status status-${status.toLowerCase()}">
                ${status}
            </div>
        </div>
        <div class="session-info">
            <div>
                <i class="fas fa-clock"></i>
                <span>Connected: ${timeText}</span>
            </div>
            ${deviceInfo ? `
                <div>
                    <i class="fas fa-mobile-alt"></i>
                    <span>Device: ${deviceInfo}</span>
                </div>
            ` : ''}
        
    `;
    
    return card;
}

function renderSessions() {
    // Update session count
    sessionCount.textContent = sessions.length;
    
    if (sessions.length === 0) {
        showSessionsState('empty');
        return;
    }
    
    // Clear existing sessions
    sessionsGrid.innerHTML = '';
    
    // Create session cards
    sessions.forEach((session, index) => {
        const card = createSessionCard(session, index);
        sessionsGrid.appendChild(card);
    });
    
    showSessionsState('data');
}

async function loadSessions() {
    if (isLoading) return;
    
    isLoading = true;
    showSessionsState('loading');
    
    try {
        const response = await getSessions();
        
        // Handle different response formats
        if (Array.isArray(response)) {
            sessions = response;
        } else if (response && typeof response === 'object') {
            // Your API returns { active: [...], status: {...} }
            sessions = response.active || response.sessions || response.data || response.results || [];
        } else {
            // If response is not what we expect, create empty array
            sessions = [];
        }
        
        renderSessions();
        
    } catch (error) {
        console.error('Failed to load sessions:', error);
        sessionsErrorMessage.textContent = `Failed to load sessions: ${error.message}`;
        showSessionsState('error');
    } finally {
        isLoading = false;
    }
}


// Event Handlers
pairForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const number = formatPhoneNumber(pairNumberInput.value);
    
    if (!validatePhoneNumber(number)) {
        showToast('Invalid Number', 'Please enter a valid phone number (10-15 digits)', 'error');
        return;
    }
    
    const submitBtn = pairForm.querySelector('.btn');
    setButtonLoading(submitBtn, true);
    
    try {
        const result = await pairNumber(number);
        
        // Check if we got a pairing code
        if (result && result.code) {
            showPairingCodeModal(number, result.code);
            pairNumberInput.value = '';
        } else if (result && result.status === 'already paired') {
            showToast('Already Paired', `Number +${number} is already paired`, 'success');
            pairNumberInput.value = '';
            await loadSessions();
        } else {
            pairNumberInput.value = '';
            await loadSessions();
        }
        
    } catch (error) {
        console.error('Failed to pair number:', error);
        showToast('Pairing Failed', `Failed to pair number: ${error.message}`, 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
});


refreshBtn.addEventListener('click', loadSessions);
retrySessionsBtn.addEventListener('click', loadSessions);

// Input Formatting
pairNumberInput.addEventListener('input', (e) => {
    // Remove any non-digit characters as user types
    e.target.value = e.target.value.replace(/\D/g, '');
});

pairNumberInput.addEventListener('paste', (e) => {
    // Handle paste events to clean up pasted content
    setTimeout(() => {
        e.target.value = e.target.value.replace(/\D/g, '');
    }, 0);
});

// Optimized smooth scroll and entrance animations
function addEntranceAnimations() {
    const cards = document.querySelectorAll('.card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Use requestAnimationFrame for smoother animations
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0) translateZ(0)';
                    }, index * 80);
                });
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px) translateZ(0)';
        card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.willChange = 'transform, opacity';
        observer.observe(card);
    });
}

// Enhanced toast with better animations
function showToast(title, message, type = 'success') {
    const toastIcon = toast.querySelector('.toast-icon');
    const toastTitle = toast.querySelector('.toast-title');
    const toastText = toast.querySelector('.toast-text');
    
    // Reset classes
    toastIcon.className = `toast-icon ${type}`;
    toast.className = `toast ${type}`;
    
    // Set content
    toastTitle.textContent = title;
    toastText.textContent = message;
    
    // Set appropriate icon with animation
    const icon = toastIcon.querySelector('i');
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
    }
    
    // Show toast with bounce effect
    toast.classList.add('show');
    
    // Add a subtle shake effect for errors
    if (type === 'error') {
        toast.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            toast.style.animation = '';
        }, 500);
    }
    
    // Hide after 4 seconds with smooth transition
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Add shake animation for errors
const shakeKeyframes = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;

// Inject shake animation
if (!document.getElementById('shake-animation')) {
    const style = document.createElement('style');
    style.id = 'shake-animation';
    style.textContent = shakeKeyframes;
    document.head.appendChild(style);
}

// Smooth scroll to sections
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    console.log('WhatsApp Bot Management Dashboard initialized');
    
    // Add entrance animations
    setTimeout(addEntranceAnimations, 100);
    
    // Load sessions
    loadSessions();
    
    // Add smooth scrolling to refresh button
    refreshBtn.addEventListener('click', () => {
        smoothScrollTo('sessions-section');
    });
});

// Optimized auto-refresh with better performance
let refreshInterval;

function startAutoRefresh() {
    clearInterval(refreshInterval);
    refreshInterval = setInterval(() => {
        if (!isLoading && !document.hidden) {
            loadSessions();
        }
    }, 30000);
}

// Start auto-refresh
startAutoRefresh();

// Handle visibility change to refresh when tab becomes active
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !isLoading) {
        loadSessions();
    }
});
