// At the top of contact.js
document.addEventListener('DOMContentLoaded', function () {
    if (typeof FormValidator === 'undefined') {
        console.error('FormValidator not found! Make sure formValidator.js is loaded first.');
        return;
    }
    
    // Initialize the contact form validator
    const contactValidator = new FormValidator('contactForm', {
        onSuccess: (data) => {
            // Show success message
            const successMessage = document.getElementById('successMessage');
            successMessage.classList.add('show');

            // Here you can add your backend submission logic
            // Example using Fetch API:
            /*
            fetch('/contact', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                console.log('Success:', result);
                successMessage.textContent = result.message || 'Thank you! Your message has been sent successfully.';
            })
            .catch(error => {
                console.error('Error:', error);
                successMessage.textContent = 'Sorry, there was an error sending your message. Please try again.';
                successMessage.style.background = 'rgba(230, 0, 40, 0.1)';
                successMessage.style.color = 'var(--primary)';
            });
            */

            // For demo purposes - log the data
            console.log('Form Data:', data);

            // Reset form after 5 seconds
            setTimeout(() => {
                contactValidator.reset();
                successMessage.classList.remove('show');
                // Reset success message styling if changed
                successMessage.style.background = '';
                successMessage.style.color = '';
                successMessage.textContent = 'Thank you! Your message has been sent successfully.';
            }, 5000);
        },
        showSuccessMessage: false, // We're using custom success styling
        validateOnInput: true
    });

    // Add validation rules for each field
    contactValidator
        .addRule('full_name', {
            required: true,
            minLength: 2,
            maxLength: 50,
            pattern: '^[a-zA-Z\\s]+$',
            patternMessage: 'Name should only contain letters and spaces'
        }, 'Please enter your full name')
        .addRule('email', {
            required: true,
            email: true
        }, 'Please enter a valid email address')
        .addRule('subject', {
            required: true,
            minLength: 3,
            maxLength: 100
        }, 'Please enter a subject (minimum 3 characters)')
        .addRule('message', {
            required: true,
            minLength: 10,
            maxLength: 1000
        }, 'Please enter a message (minimum 10 characters)');

    // Optional: Add smooth scroll to first error on submit
    document.getElementById('contactForm').addEventListener('submit', function (e) {
        setTimeout(() => {
            const firstError = document.querySelector('.validation-indicator.error');
            if (firstError) {
                firstError.closest('.form-group').scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }, 100);
    });

    // Optional: Character counter for message field
    const messageField = document.getElementById('message');
    const messageGroup = messageField.closest('.form-group');

    // Create character counter element
    const charCounter = document.createElement('div');
    charCounter.className = 'char-counter';
    charCounter.style.cssText = 'font-size: 12px; color: var(--muted-color); margin-top: 5px; text-align: right;';
    messageGroup.appendChild(charCounter);

    // Update character counter
    messageField.addEventListener('input', function () {
        const length = this.value.length;
        const maxLength = 1000;
        charCounter.textContent = `${length}/${maxLength} characters`;

        if (length > maxLength * 0.9) {
            charCounter.style.color = 'var(--primary)';
        } else {
            charCounter.style.color = 'var(--muted-color)';
        }
    });

    // Initialize character counter
    messageField.dispatchEvent(new Event('input'));
});