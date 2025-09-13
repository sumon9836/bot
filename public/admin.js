// API Configuration  
const API_BASE_URL = '/api/admin';

// DOM Elements
const blockForm = document.getElementById('blockForm');
const blockNumberInput = document.getElementById('blockNumber');
const refreshBlocklistBtn = document.getElementById('refreshBlocklist');
const blocklistGrid = document.getElementById('blocklistGrid');
const blocklistLoader = document.getElementById('blocklistLoader');
const blocklistError = document.getElementById('blocklistError');
const blocklistEmpty = document.getElementById('blocklistEmpty');
const blocklistErrorMessage = document.getElementById('blocklistErrorMessage');
const retryBlocklistBtn = document.getElementById('retryBlocklist');
const blockedCount = document.getElementById('blockedCount');
const toast = document.getElementById('toast');

// Application State
let blockedUsers = {};
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
    const toastMessage = toast.querySelector('.toast-message');
    
    // Reset classes
    toastIcon.className = `toast-icon ${type}`;
    toast.className = `toast ${type}`;
    
    // Set content
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // Set appropriate icon
    const icon = toastIcon.querySelector('i');
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
    } else if (type === 'warning') {
        icon.className = 'fas fa-exclamation-triangle';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// API Functions
async function blockUser(number) {
    try {
        const response = await fetch(`${API_BASE_URL}/block`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ number })
        });
        const data = await response.json();
        
        if (data.success) {
            showToast('User Blocked', data.message, 'success');
            loadBlockedUsers(); // Refresh the list
            blockNumberInput.value = ''; // Clear input
            return true;
        } else {
            showToast('Block Failed', data.error || 'Failed to block user', 'error');
            return false;
        }
    } catch (error) {
        console.error('Block user error:', error);
        showToast('Network Error', 'Failed to connect to server', 'error');
        return false;
    }
}

async function unblockUser(number) {
    try {
        const response = await fetch(`${API_BASE_URL}/unblock`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ number })
        });
        const data = await response.json();
        
        if (data.success) {
            showToast('User Unblocked', data.message, 'success');
            loadBlockedUsers(); // Refresh the list
            blockNumberInput.value = ''; // Clear input
            return true;
        } else {
            showToast('Unblock Failed', data.error || 'Failed to unblock user', 'error');
            return false;
        }
    } catch (error) {
        console.error('Unblock user error:', error);
        showToast('Network Error', 'Failed to connect to server', 'error');
        return false;
    }
}

async function loadBlockedUsers() {
    if (isLoading) return;
    
    isLoading = true;
    
    // Show loading state
    blocklistLoader.style.display = 'block';
    blocklistError.style.display = 'none';
    blocklistEmpty.style.display = 'none';
    blocklistGrid.style.display = 'none';
    
    try {
        const response = await fetch(`${API_BASE_URL}/blocklist`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        blockedUsers = data;
        renderBlockedUsers();
        
    } catch (error) {
        console.error('Load blocklist error:', error);
        blocklistError.style.display = 'block';
        blocklistErrorMessage.textContent = error.message || 'Failed to load blocked users';
    } finally {
        blocklistLoader.style.display = 'none';
        isLoading = false;
    }
}

function renderBlockedUsers() {
    const userNumbers = Object.keys(blockedUsers);
    
    if (userNumbers.length === 0) {
        blocklistEmpty.style.display = 'block';
        blocklistGrid.style.display = 'none';
        blockedCount.textContent = '0';
        return;
    }
    
    blocklistEmpty.style.display = 'none';
    blocklistGrid.style.display = 'grid';
    
    // Update count
    blockedCount.textContent = userNumbers.length;
    
    // Clear existing content
    blocklistGrid.innerHTML = '';
    
    // Create cards for each blocked user
    userNumbers.forEach(number => {
        const userCard = createBlockedUserCard(number);
        blocklistGrid.appendChild(userCard);
    });
}

function createBlockedUserCard(number) {
    const card = document.createElement('div');
    card.className = 'blocked-user-card';
    card.innerHTML = `
        <div class="user-info">
            <div class="user-avatar">
                <i class="fas fa-user-slash"></i>
            </div>
            <div class="user-details">
                <h3 class="user-number">+${number}</h3>
                <span class="user-status">
                    <i class="fas fa-ban"></i>
                    Blocked
                </span>
            </div>
        </div>
        <div class="user-actions">
            <button class="btn btn-sm btn-success unblock-btn" data-number="${number}">
                <i class="fas fa-unlock"></i>
                Unblock
            </button>
        </div>
    `;
    
    // Add unblock event listener
    const unblockBtn = card.querySelector('.unblock-btn');
    unblockBtn.addEventListener('click', async () => {
        unblockBtn.disabled = true;
        unblockBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Unblocking...';
        
        const success = await unblockUser(number);
        
        if (!success) {
            unblockBtn.disabled = false;
            unblockBtn.innerHTML = '<i class="fas fa-unlock"></i> Unblock';
        }
    });
    
    return card;
}

// Event Handlers
function handleBlockForm(event) {
    event.preventDefault();
    
    const number = formatPhoneNumber(blockNumberInput.value);
    const actionButton = event.submitter;
    const action = actionButton.dataset.action;
    
    if (!validatePhoneNumber(number)) {
        showToast('Invalid Number', 'Please enter a valid phone number (10-15 digits)', 'error');
        return;
    }
    
    // Disable buttons and show loading
    const buttons = blockForm.querySelectorAll('button');
    buttons.forEach(btn => btn.disabled = true);
    
    if (action === 'block') {
        actionButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Blocking...';
        blockUser(number).finally(() => {
            buttons.forEach(btn => btn.disabled = false);
            actionButton.innerHTML = '<i class="fas fa-ban"></i> Block User';
        });
    } else if (action === 'unblock') {
        actionButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Unblocking...';
        unblockUser(number).finally(() => {
            buttons.forEach(btn => btn.disabled = false);
            actionButton.innerHTML = '<i class="fas fa-check-circle"></i> Unblock User';
        });
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Load blocked users on page load
    loadBlockedUsers();
    
    // Set up event listeners
    blockForm.addEventListener('submit', handleBlockForm);
    
    // Handle unblock button in form
    const unblockButton = blockForm.querySelector('[data-action="unblock"]');
    unblockButton.addEventListener('click', (e) => {
        e.preventDefault();
        const number = formatPhoneNumber(blockNumberInput.value);
        
        if (!validatePhoneNumber(number)) {
            showToast('Invalid Number', 'Please enter a valid phone number (10-15 digits)', 'error');
            return;
        }
        
        // Create a fake event with the unblock button as submitter
        const fakeEvent = new Event('submit');
        fakeEvent.submitter = unblockButton;
        handleBlockForm(fakeEvent);
    });
    
    refreshBlocklistBtn.addEventListener('click', loadBlockedUsers);
    retryBlocklistBtn.addEventListener('click', loadBlockedUsers);
    
    // Toast close button
    const toastClose = toast.querySelector('.toast-close');
    toastClose.addEventListener('click', () => {
        toast.classList.remove('show');
    });
    
    // Phone number input formatting
    blockNumberInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
});

// Auto-refresh blocklist every 30 seconds
setInterval(() => {
    if (!isLoading && !document.hidden) {
        loadBlockedUsers();
    }
}, 30000);

// Refresh on page visibility change
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !isLoading) {
        loadBlockedUsers();
    }
});