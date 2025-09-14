
// Login page functionality
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');
    const loginBtn = document.querySelector('.login-btn');
    const toast = document.getElementById('toast');

    // Check if already logged in
    checkAuthStatus();

    // Password toggle functionality
    if (passwordToggle) {
        passwordToggle.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = passwordToggle.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    loginForm.addEventListener('submit', handleLogin);

    async function handleLogin(e) {
        e.preventDefault();
        
        const password = passwordInput.value.trim();
        
        if (!password) {
            showToast('Please enter password', 'error');
            return;
        }

        // Show loading state
        loginBtn.disabled = true;
        const btnText = loginBtn.querySelector('.btn-text');
        const btnLoader = loginBtn.querySelector('.btn-loader');
        
        if (btnText) btnText.style.display = 'none';
        if (btnLoader) btnLoader.style.display = 'flex';

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
                showToast('Login successful! Redirecting...', 'success');
                // Redirect to admin panel after short delay
                setTimeout(() => {
                    window.location.href = '/admin';
                }, 1000);
            } else {
                showToast(data.error || 'Invalid password', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast('Login failed. Please try again.', 'error');
        } finally {
            loginBtn.disabled = false;
            if (btnText) btnText.style.display = 'flex';
            if (btnLoader) btnLoader.style.display = 'none';
        }
    }

    async function checkAuthStatus() {
        try {
            const response = await fetch('/api/admin/banlist', {
                credentials: 'include'
            });
            
            if (response.ok) {
                // Already authenticated, redirect to admin panel
                window.location.href = '/admin';
            }
        } catch (error) {
            // Not authenticated, stay on login page
            console.log('Not authenticated');
        }
    }

    function showToast(message, type = 'success') {
        const toastIcon = toast.querySelector('.toast-icon i');
        const toastTitle = toast.querySelector('.toast-title');
        const toastText = toast.querySelector('.toast-text');
        
        // Update toast content
        if (type === 'success') {
            toastIcon.className = 'fas fa-check-circle';
            toastTitle.textContent = 'Success';
            toast.querySelector('.toast-icon').className = 'toast-icon success';
        } else {
            toastIcon.className = 'fas fa-exclamation-circle';
            toastTitle.textContent = 'Error';
            toast.querySelector('.toast-icon').className = 'toast-icon error';
        }
        
        toastText.textContent = message;
        
        // Show toast
        toast.classList.add('show');
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Toast close button
    const toastClose = toast.querySelector('.toast-close');
    if (toastClose) {
        toastClose.addEventListener('click', () => {
            toast.classList.remove('show');
        });
    }
});
