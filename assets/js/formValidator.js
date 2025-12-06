class FormValidator {
  constructor(formId, options = {}) {
    this.form = document.getElementById(formId);
    this.options = {
      indicatorPosition: options.indicatorPosition || 'after',
      showSuccessMessage: options.showSuccessMessage !== false,
      validateOnInput: options.validateOnInput !== false,
      ...options
    };
    
    this.rules = {};
    this.customMessages = {};
    this.init();
  }

  init() {
    if (!this.form) {
      console.error('Form not found');
      return;
    }

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.validateAll()) {
        this.onSuccess();
      }
    });

    if (this.options.validateOnInput) {
      this.form.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('blur', () => this.validateField(field));
        field.addEventListener('input', () => {
          if (field.classList.contains('error') || field.classList.contains('success')) {
            this.validateField(field);
          }
        });
      });
    }
  }

  addRule(fieldName, rules, customMessage = '') {
    this.rules[fieldName] = rules;
    if (customMessage) {
      this.customMessages[fieldName] = customMessage;
    }
    return this;
  }

  validateField(field) {
    const fieldName = field.name || field.id;
    const rules = this.rules[fieldName];
    
    if (!rules) return true;

    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Required validation
    if (rules.required && !value) {
      isValid = false;
      errorMessage = this.customMessages[fieldName] || 'This field is required';
    }

    // Min length validation
    if (isValid && rules.minLength && value.length < rules.minLength) {
      isValid = false;
      errorMessage = `Minimum ${rules.minLength} characters required`;
    }

    // Max length validation
    if (isValid && rules.maxLength && value.length > rules.maxLength) {
      isValid = false;
      errorMessage = `Maximum ${rules.maxLength} characters allowed`;
    }

    // Email validation
    if (isValid && rules.email && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    }

    // Phone validation
    if (isValid && rules.phone && value) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number';
      }
    }

    // Number validation
    if (isValid && rules.number && value) {
      if (isNaN(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid number';
      }
    }

    // Min value validation
    if (isValid && rules.min !== undefined && value) {
      if (parseFloat(value) < rules.min) {
        isValid = false;
        errorMessage = `Value must be at least ${rules.min}`;
      }
    }

    // Max value validation
    if (isValid && rules.max !== undefined && value) {
      if (parseFloat(value) > rules.max) {
        isValid = false;
        errorMessage = `Value must be at most ${rules.max}`;
      }
    }

    // URL validation
    if (isValid && rules.url && value) {
      try {
        new URL(value);
      } catch {
        isValid = false;
        errorMessage = 'Please enter a valid URL';
      }
    }

    // Pattern validation
    if (isValid && rules.pattern && value) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(value)) {
        isValid = false;
        errorMessage = rules.patternMessage || 'Invalid format';
      }
    }

    // Match field validation
    if (isValid && rules.matches && value) {
      const matchField = this.form.querySelector(`[name="${rules.matches}"]`);
      if (matchField && value !== matchField.value) {
        isValid = false;
        errorMessage = 'Fields do not match';
      }
    }

    // Custom validation function
    if (isValid && rules.custom && typeof rules.custom === 'function') {
      const customResult = rules.custom(value, field);
      if (customResult !== true) {
        isValid = false;
        errorMessage = typeof customResult === 'string' ? customResult : 'Validation failed';
      }
    }

    this.updateFieldStatus(field, isValid, errorMessage);
    return isValid;
  }

  updateFieldStatus(field, isValid, message) {
    const existingIndicator = field.parentElement.querySelector('.validation-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }

    field.classList.remove('error', 'success');

    if (isValid && this.options.showSuccessMessage && field.value.trim()) {
      field.classList.add('success');
      if (this.options.showSuccessMessage) {
        this.createIndicator(field, 'success', '✓ Valid');
      }
    } else if (!isValid) {
      field.classList.add('error');
      this.createIndicator(field, 'error', message);
    }
  }

  createIndicator(field, type, message) {
    const indicator = document.createElement('span');
    indicator.className = `validation-indicator ${type}`;
    indicator.textContent = message;
    
    if (this.options.indicatorPosition === 'after') {
      field.parentElement.appendChild(indicator);
    } else {
      field.parentElement.insertBefore(indicator, field.nextSibling);
    }
  }

  validateAll() {
    let isFormValid = true;
    const fields = this.form.querySelectorAll('input, textarea, select');
    
    fields.forEach(field => {
      const fieldName = field.name || field.id;
      if (this.rules[fieldName]) {
        const isValid = this.validateField(field);
        if (!isValid) {
          isFormValid = false;
        }
      }
    });

    return isFormValid;
  }

  onSuccess() {
    if (this.options.onSuccess && typeof this.options.onSuccess === 'function') {
      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData);
      this.options.onSuccess(data);
    }
  }

  reset() {
    this.form.reset();
    this.form.querySelectorAll('.validation-indicator').forEach(el => el.remove());
    this.form.querySelectorAll('.error, .success').forEach(el => {
      el.classList.remove('error', 'success');
    });
  }
}

// Add default styles
const style = document.createElement('style');
style.textContent = `
  .validation-indicator {
    display: block;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    font-weight: 500;
  }
  
  .validation-indicator.error {
    color: #dc2626;
  }
  
  .validation-indicator.success {
    color: #16a34a;
  }
  
  input.error, textarea.error, select.error {
    border-color: #dc2626 !important;
    outline-color: #dc2626 !important;
  }
  
  input.success, textarea.success, select.success {
    border-color: #16a34a !important;
  }
`;
document.head.appendChild(style);

// Usage Example:
/*
const validator = new FormValidator('myForm', {
  onSuccess: (data) => {
    console.log('Form submitted successfully!', data);
    alert('Form submitted successfully!');
  },
  showSuccessMessage: true,
  validateOnInput: true
});

validator
  .addRule('email', { required: true, email: true })
  .addRule('password', { required: true, minLength: 8 })
  .addRule('confirmPassword', { required: true, matches: 'password' })
  .addRule('username', { required: true, minLength: 3, maxLength: 20 })
  .addRule('age', { required: true, number: true, min: 18, max: 120 })
  .addRule('phone', { phone: true })
  .addRule('website', { url: true })
  .addRule('message', { required: true, minLength: 10 });
*/