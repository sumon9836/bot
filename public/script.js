// API Configuration - Using Vercel API routes  
const API_BASE_URL = '/api';

// DOM Elements
const pairForm = document.getElementById('pairForm');
const deleteForm = document.getElementById('deleteForm');
const pairNumberInput = document.getElementById('pairNumber');
const deleteNumberInput = document.getElementById('deleteNumber');
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
                <div class="pairing-number">
                    <i class="fas fa-phone"></i>
                    Number: +${number}
                </div>
                <div class="pairing-code-container">
                    <div class="pairing-code-label">Enter this code in WhatsApp:</div>
                    <div class="pairing-code" id="pairingCode">${code}</div>
                    <button class="btn btn-secondary copy-code-btn" onclick="copyPairingCode('${code}')">
                        <i class="fas fa-copy"></i>
                        Copy Code
                    </button>
                </div>
                <div class="pairing-instructions">
                    <h3>How to pair:</h3>
                    <ol>
                        <li>Open WhatsApp on your phone</li>
                        <li>Go to Settings → Linked Devices</li>
                        <li>Tap "Link a Device"</li>
                        <li>Tap "Link with phone number instead"</li>
                        <li>Enter the code above when prompted</li>
                    </ol>
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

window.copyPairingCode = function(code) {
    navigator.clipboard.writeText(code).then(() => {
        showToast('Copied!', 'Pairing code copied to clipboard', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Copied!', 'Pairing code copied to clipboard', 'success');
    });
};

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

async function deleteNumber(number) {
    return await makeApiRequest(`/logout?number=${encodeURIComponent(number)}`);
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

// Global function for session removal (called from session cards)
window.deleteSessionNumber = async function(number) {
    // Clean the number (remove + if present)
    const cleanNumber = number.toString().replace(/^\+/, '');
    
    const confirmed = confirm(`🗑️ Remove Session\n\nAre you sure you want to logout and remove +${cleanNumber} from the bot?\n\nThis action cannot be undone.`);
    if (!confirmed) return;
    
    // Find and disable the button during deletion
    const deleteButton = document.querySelector(`button[onclick="deleteSessionNumber('${number}')"]`);
    if (deleteButton) {
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Removing...';
    }
    
    try {
        await deleteNumber(cleanNumber);
        showToast('Session Removed', `Number +${cleanNumber} has been logged out successfully`, 'success');
        
        // Remove from local sessions array
        sessions = sessions.filter(session => {
            const sessionNumber = typeof session === 'object' 
                ? (session.number || session.phone || session.id)
                : session.toString();
            return sessionNumber.replace(/^\+/, '') !== cleanNumber;
        });
        
        renderSessions();
        
        // Reload sessions from server to confirm removal
        setTimeout(() => {
            loadSessions();
        }, 1000);
        
    } catch (error) {
        console.error('Failed to delete session:', error);
        showToast('Removal Failed', `Failed to remove number: ${error.message}`, 'error');
        
        // Re-enable button on error
        if (deleteButton) {
            deleteButton.disabled = false;
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Remove Session';
        }
    }
};

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
            showToast('Success', `Number +${number} has been processed successfully`);
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

deleteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const number = formatPhoneNumber(deleteNumberInput.value);
    
    if (!validatePhoneNumber(number)) {
        showToast('Invalid Number', 'Please enter a valid phone number (10-15 digits)', 'error');
        return;
    }
    
    const confirmed = confirm(`Are you sure you want to remove +${number}?`);
    if (!confirmed) return;
    
    const submitBtn = deleteForm.querySelector('.btn');
    setButtonLoading(submitBtn, true);
    
    try {
        await deleteNumber(number);
        showToast('Success', `Number +${number} has been removed successfully`);
        deleteNumberInput.value = '';
        
        // Reload sessions to reflect the deletion
        await loadSessions();
        
    } catch (error) {
        console.error('Failed to delete number:', error);
        showToast('Deletion Failed', `Failed to remove number: ${error.message}`, 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
});

refreshBtn.addEventListener('click', loadSessions);
retrySessionsBtn.addEventListener('click', loadSessions);

// Input Formatting
[pairNumberInput, deleteNumberInput].forEach(input => {
    input.addEventListener('input', (e) => {
        // Remove any non-digit characters as user types
        e.target.value = e.target.value.replace(/\D/g, '');
    });
    
    input.addEventListener('paste', (e) => {
        // Handle paste events to clean up pasted content
        setTimeout(() => {
            e.target.value = e.target.value.replace(/\D/g, '');
        }, 0);
    });
});

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    console.log('WhatsApp Bot Management Dashboard initialized');
    loadSessions();
});

// Auto-refresh sessions every 30 seconds
setInterval(() => {
    if (!isLoading) {
        loadSessions();
    }
}, 30000);

// Handle visibility change to refresh when tab becomes active
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !isLoading) {
        loadSessions();
    }
});
