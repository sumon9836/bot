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
    let deleteSuccess = false;
    let deleteMessage = '';
    
    try {
        // First attempt to delete/logout the user
        showToast('Processing', 'Attempting to delete/logout user first...', 'warning');
        
        try {
            const deleteResponse = await fetch(`${API_BASE_URL}/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ number })
            });
            const deleteData = await deleteResponse.json();
            
            if (deleteData.success) {
                deleteSuccess = true;
                deleteMessage = 'User was deleted/logged out and then blocked successfully';
                // Wait a moment before blocking
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                console.warn('Delete failed, proceeding to block:', deleteData.error);
                deleteMessage = `User blocked (delete/logout failed: ${deleteData.error || 'unknown error'})`;
            }
        } catch (deleteError) {
            console.warn('Delete request failed, proceeding to block:', deleteError.message);
            deleteMessage = `User blocked (delete/logout failed: ${deleteError.message})`;
        }
        
        // Always proceed to block the user regardless of delete success
        showToast('Processing', 'Now blocking the user...', 'warning');
        
        const blockResponse = await fetch(`${API_BASE_URL}/block`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ number })
        });
        const blockData = await blockResponse.json();
        
        if (blockData.success) {
            showToast('User Blocked', deleteMessage, 'success');
            loadBlockedUsers(); // Refresh the list
            blockNumberInput.value = ''; // Clear input
            return true;
        } else {
            const errorMsg = deleteSuccess 
                ? 'User was deleted but blocking failed' 
                : 'Both delete and block operations failed';
            showToast('Block Failed', blockData.error || errorMsg, 'error');
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

async function deleteUser(number) {
    try {
        const response = await fetch(`${API_BASE_URL}/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ number })
        });
        const data = await response.json();
        
        if (data.success) {
            showToast('User Deleted/Logged Out', data.message, 'success');
            blockNumberInput.value = ''; // Clear input
            return true;
        } else {
            showToast('Delete Failed', data.error || 'Failed to delete/logout user', 'error');
            return false;
        }
    } catch (error) {
        console.error('Delete user error:', error);
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
        const response = await fetch(`${API_BASE_URL}/banlist`, {
            credentials: 'include'
        });
        
        const contentType = response.headers.get('content-type');
        if (!response.ok || !contentType || !contentType.includes('application/json')) {
            console.log('Non-JSON response or error received, using empty banlist');
            blockedUsers = {};
            renderBlockedUsers();
            return;
        }
        
        const responseText = await response.text();
        
        // Check if response starts with HTML
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
            console.log('HTML response received, using empty banlist');
            blockedUsers = {};
            renderBlockedUsers();
            return;
        }
        
        const data = JSON.parse(responseText);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Ensure data is an object
        blockedUsers = data && typeof data === 'object' ? data : {};
        renderBlockedUsers();
        
    } catch (error) {
        console.error('Load banlist error:', error);
        
        // If it's a JSON parse error, show empty state instead of error
        if (error.message.includes('Unexpected token') || error.message.includes('JSON')) {
            console.log('JSON parse error, showing empty banlist');
            blockedUsers = {};
            renderBlockedUsers();
        } else {
            blocklistError.style.display = 'block';
            blocklistErrorMessage.textContent = error.message || 'Failed to load banned users';
        }
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
        actionButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Delete & Block...';
        blockUser(number).finally(() => {
            buttons.forEach(btn => btn.disabled = false);
            actionButton.innerHTML = '<i class="fas fa-ban"></i> Block User';
        });
    } else if (action === 'delete') {
        actionButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
        deleteUser(number).finally(() => {
            buttons.forEach(btn => btn.disabled = false);
            actionButton.innerHTML = '<i class="fas fa-trash"></i> Delete/Logout';
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
    
    // Handle delete button in form
    const deleteButton = blockForm.querySelector('[data-action="delete"]');
    deleteButton.addEventListener('click', (e) => {
        e.preventDefault();
        const number = formatPhoneNumber(blockNumberInput.value);
        
        if (!validatePhoneNumber(number)) {
            showToast('Invalid Number', 'Please enter a valid phone number (10-15 digits)', 'error');
            return;
        }
        
        // Create a fake event with the delete button as submitter
        const fakeEvent = new Event('submit');
        fakeEvent.submitter = deleteButton;
        handleBlockForm(fakeEvent);
    });

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