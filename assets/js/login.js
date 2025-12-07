// Initialize form validator
const validator = new FormValidator('loginForm', {
    onSuccess: (data) => {
        console.log('Login successful!', data);
        alert('Login successful! Welcome, ' + data.firstName + '!');
        // Here you would typically send data to your server
        // Then redirect to login or dashboard
    },
    showSuccessMessage: true,
    validateOnInput: true
});

// Add validation rules
validator
    .addRule('email', {
        required: true,
        email: true
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

// // Password strength indicator
// const passwordInput = document.getElementById('password');
// const strengthBar = document.getElementById('strengthBar');

// passwordInput.addEventListener('input', () => {
//     const password = passwordInput.value;
//     let strength = 0;

//     if (password.length >= 8) strength++;
//     if (password.length >= 12) strength++;
//     if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
//     if (/[0-9]/.test(password)) strength++;
//     if (/[^a-zA-Z0-9]/.test(password)) strength++;
// });

// Social login buttons (placeholder functionality)
// document.querySelectorAll('.social-btn').forEach(btn => {
//     btn.addEventListener('click', () => {
//         alert('Social login integration would be implemented here');
//     });
// });