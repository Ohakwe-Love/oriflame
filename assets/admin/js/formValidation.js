/**
 * Utility: validate a form with dynamic rules
 * @param {string} formSelector - CSS selector for the form
 * @param {object} rules - validation rules { fieldName: ruleFn }
 */
export function setupFormValidation(formSelector, rules) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    let userInteracted = {}; // Tracks whether a user has started typing in an input

    // Helper: set state classes (error/success)
    function setValidationState(element, isValid) {
        element.classList.remove("error", "success");
        if (userInteracted[element.name]) {
            element.classList.add(isValid ? "success" : "error");
        }
    }

    // Main validation function
    function validate() {
        let allValid = true;

        Object.entries(rules).forEach(([field, rule]) => {
            const input =
                form.querySelector(`[name="${field}"]`) ||
                form.querySelector(`#${field}`);
            if (!input) return;

            const target =
                input.type === "file"
                    ? input.closest(".skill-icon-input-group") || input
                    : input.closest(".skill-icon-input-group") || input;

            const valid = rule(input);
            setValidationState(target, valid);

            if (!valid) allValid = false;
        });

        if (submitBtn) {
            submitBtn.disabled = !allValid;
            submitBtn.classList.toggle("disabled", !allValid);
        }

        return allValid;
    }

    // When user starts typing, mark field as interacted
    form.querySelectorAll("input, textarea").forEach((input) => {
        input.addEventListener("input", () => {
            userInteracted[input.name] = true;
            validate();
        });
        input.addEventListener("change", () => {
            userInteracted[input.name] = true;
            validate();
        });
    });

    // Prevent refresh on submit
    form.addEventListener("submit", (e) => {
        e.preventDefault(); // Stop reload
        const isValid = validate();

        if (isValid) {
            console.log("Form submitted successfully!");
            // Handle AJAX or your logic here
        } else {
            console.log("Please fix the errors first.");
        }
    });
}
