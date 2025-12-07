// Initialize form validator
const validator = new FormValidator('registerForm', {
    onSuccess: (data) => {
        console.log('Registration successful!', data);
        alert('Registration successful! Welcome, ' + data.firstName + '!');
        // Here you would typically send data to your server
        // Then redirect to login or dashboard
    },
    showSuccessMessage: true,
    validateOnInput: true
});

// Add validation rules
validator
    .addRule('firstName', {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: '^[a-zA-Z\\s]+$',
        patternMessage: 'Only letters are allowed'
    })
    .addRule('lastName', {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: '^[a-zA-Z\\s]+$',
        patternMessage: 'Only letters are allowed'
    })
    .addRule('email', {
        required: true,
        email: true
    })
    .addRule('phone', {
        phone: true
    })
    .addRule('username', {
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: '^[a-zA-Z0-9_]+$',
        patternMessage: 'Only letters, numbers, and underscores allowed'
    })
    .addRule('password', {
        required: true,
        minLength: 8,
        custom: (value) => {
            const hasUpperCase = /[A-Z]/.test(value);
            const hasLowerCase = /[a-z]/.test(value);
            const hasNumber = /[0-9]/.test(value);

            if (!hasUpperCase || !hasLowerCase || !hasNumber) {
                return 'Password must contain uppercase, lowercase, and number';
            }
            return true;
        }
    })
    .addRule('confirmPassword', {
        required: true,
        matches: 'password'
    })
    .addRule('country', {
        required: true
    })
    .addRule('terms', {
        custom: (value, field) => {
            if (!field.checked) {
                return 'You must accept the terms and conditions';
            }
            return true;
        }
    });

// Password strength indicator
const passwordInput = document.getElementById('password');
const strengthBar = document.getElementById('strengthBar');

passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    strengthBar.className = 'password-strength-bar';

    if (strength <= 2) {
        strengthBar.classList.add('weak');
    } else if (strength <= 4) {
        strengthBar.classList.add('medium');
    } else {
        strengthBar.classList.add('strong');
    }
});

// Social login buttons (placeholder functionality)
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        alert('Social login integration would be implemented here');
    });
});