
// Login page functionality
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.querySelector('.submit-btn');
    const errorMessage = document.querySelector('.error-message');

    // Check if already logged in
    checkAuthStatus();

    loginForm.addEventListener('submit', handleLogin);

    async function handleLogin(e) {
        e.preventDefault();
        
        const password = passwordInput.value.trim();
        
        if (!password) {
            showError('Please enter password');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        hideError();

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (data.success) {
                // Redirect to admin panel
                window.location.href = '/admin.html';
            } else {
                showError(data.error || 'Invalid password');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Login failed. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        }
    }

    async function checkAuthStatus() {
        try {
            const response = await fetch('/api/admin/banlist', {
                credentials: 'include'
            });
            
            if (response.ok) {
                // Already authenticated, redirect to admin panel
                window.location.href = '/admin.html';
            }
        } catch (error) {
            // Not authenticated, stay on login page
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function hideError() {
        errorMessage.style.display = 'none';
    }
});
