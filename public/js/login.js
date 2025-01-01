document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Tab switching functionality
    tabBtns.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and forms
            tabBtns.forEach(btn => btn.classList.remove('active'));
            authForms.forEach(form => form.classList.remove('active'));

            // Add active class to clicked button and corresponding form
            button.classList.add('active');
            const formToShow = button.dataset.tab === 'login' ? loginForm : signupForm;
            formToShow.classList.add('active');
        });
    });

    // Password validation for signup
    function validatePassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const minLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        
        return minLength && hasUpper && hasLower && hasNumber;
    }

    // Form validation and submission handling
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const password = this.querySelector('input[name="password"]').value;
        const confirmPassword = this.querySelector('input[name="confirm_password"]').value;
        const email = this.querySelector('input[name="email"]').value;
        const fullname = this.querySelector('input[name="fullname"]').value;
        const terms = this.querySelector('input[name="terms"]').checked;

        // Clear any existing error messages
        const existingErrors = this.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());

        let isValid = true;

        // Validate password strength
        if (!validatePassword(password)) {
            isValid = false;
            showError(this.querySelector('input[name="password"]'), 
                'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers');
        }

        // Validate password match
        if (password !== confirmPassword) {
            isValid = false;
            showError(this.querySelector('input[name="confirm_password"]'), 
                'Passwords do not match');
        }

        // Validate email format
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            isValid = false;
            showError(this.querySelector('input[name="email"]'), 
                'Please enter a valid email address');
        }

        // Validate name
        if (fullname.length < 2) {
            isValid = false;
            showError(this.querySelector('input[name="fullname"]'), 
                'Please enter your full name');
        }

        // Check terms acceptance
        if (!terms) {
            isValid = false;
            showError(this.querySelector('input[name="terms"]').parentElement, 
                'You must accept the Terms & Conditions');
        }

        // If all validations pass, submit the form
        if (isValid) {
            // You can either submit the form traditionally:
            // this.submit();
            
            // Or use fetch for AJAX submission:
            const formData = new FormData(this);
            fetch('../api/auth/signup.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSuccess('Account created successfully! Redirecting to login...');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    showError(this, data.message || 'An error occurred during signup');
                }
            })
            .catch(error => {
                showError(this, 'An error occurred. Please try again later.');
            });
        }
    });

    // Login form handling
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = this.querySelector('input[name="email"]').value;
        const password = this.querySelector('input[name="password"]').value;
        const rememberMe = this.querySelector('input[name="remember"]').checked;

        // Basic validation
        let isValid = true;

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            isValid = false;
            showError(this.querySelector('input[name="email"]'), 
                'Please enter a valid email address');
        }

        if (password.length < 1) {
            isValid = false;
            showError(this.querySelector('input[name="password"]'), 
                'Please enter your password');
        }

        if (isValid) {
            const formData = new FormData(this);
            fetch('../api/auth/login.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSuccess('Login successful! Redirecting...');
                    setTimeout(() => {
                        window.location.href = '/taskaid/dashboard/todo.php';
                    }, 1500);
                } else {
                    showError(this, data.message || 'Invalid email or password');
                }
            })
            .catch(error => {
                showError(this, 'An error occurred. Please try again later.');
            });
        }
    });

    // Utility function to show error messages
    function showError(element, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#dc2626';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.5rem';
        errorDiv.textContent = message;
        element.parentNode.appendChild(errorDiv);
    }

    // Utility function to show success messages
    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.color = '#059669';
        successDiv.style.fontSize = '1rem';
        successDiv.style.textAlign = 'center';
        successDiv.style.padding = '1rem';
        successDiv.style.marginTop = '1rem';
        successDiv.textContent = message;
        
        const activeForm = document.querySelector('.auth-form.active');
        activeForm.appendChild(successDiv);
    }
});