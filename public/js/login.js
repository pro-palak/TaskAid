document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    tabBtns.forEach(button => {
        button.addEventListener('click', () => {
            tabBtns.forEach(btn => btn.classList.remove('active'));
            authForms.forEach(form => form.classList.remove('active'));

            button.classList.add('active');
            const formToShow = button.dataset.tab === 'login' ? loginForm : signupForm;
            formToShow.classList.add('active');
        });
    });

    function validatePassword(password) {
        const minLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        
        return minLength && hasUpper && hasLower && hasNumber;
    }

    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const password = this.querySelector('input[name="password"]').value;
        const confirmPassword = this.querySelector('input[name="confirm_password"]').value;
        const email = this.querySelector('input[name="email"]').value;
        const fullname = this.querySelector('input[name="fullname"]').value;
        const terms = this.querySelector('input[name="terms"]').checked;

        const existingErrors = this.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());

        let isValid = true;

        if (!validatePassword(password)) {
            isValid = false;
            showError(this.querySelector('input[name="password"]'), 
                'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers');
        }

        if (password !== confirmPassword) {
            isValid = false;
            showError(this.querySelector('input[name="confirm_password"]'), 
                'Passwords do not match');
        }

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            isValid = false;
            showError(this.querySelector('input[name="email"]'), 
                'Please enter a valid email address');
        }

        if (fullname.length < 2) {
            isValid = false;
            showError(this.querySelector('input[name="fullname"]'), 
                'Please enter your full name');
        }

        if (!terms) {
            isValid = false;
            showError(this.querySelector('input[name="terms"]').parentElement, 
                'You must accept the Terms & Conditions');
        }

        if (isValid) {
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

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = this.querySelector('input[name="email"]').value;
        const password = this.querySelector('input[name="password"]').value;
        const rememberMe = this.querySelector('input[name="remember"]').checked;

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

    function showError(element, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#dc2626';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.5rem';
        errorDiv.textContent = message;
        element.parentNode.appendChild(errorDiv);
    }

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