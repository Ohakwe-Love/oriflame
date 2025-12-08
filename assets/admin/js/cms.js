
// --- CMS table row editing (enableEdit / saveEdit / cancelEdit) ---
// Provides the same UX as admin-cms-dashboard.html: toggles .editing on rows,
// swaps between .view-mode and .edit-mode, and supports keyboard actions.

function enableEdit(button) {
    const row = button.closest('tr');
    if (!row) return;
    row.classList.add('editing');

    // Focus first editable control
    const firstInput = row.querySelector('.edit-input, .edit-textarea');
    if (firstInput) firstInput.focus();
}

function saveEdit(button) {
    const row = button.closest('tr');
    if (!row) return;

    const cells = row.querySelectorAll('td');
    cells.forEach(cell => {
        const input = cell.querySelector('.edit-input');
        const textarea = cell.querySelector('.edit-textarea');
        const viewMode = cell.querySelector('.view-mode');

        if (input && viewMode) viewMode.textContent = input.value;
        if (textarea && viewMode) viewMode.textContent = textarea.value;
    });

    row.classList.remove('editing');

    // TODO: wire an AJAX/save call here if required
    const rowId = row.getAttribute('data-id');
    // console.log('Saving data for row:', rowId);
    showNotification('Changes saved successfully!');
}

function cancelEdit(button) {
    const row = button.closest('tr');
    if (!row) return;

    const cells = row.querySelectorAll('td');
    cells.forEach(cell => {
        const input = cell.querySelector('.edit-input');
        const textarea = cell.querySelector('.edit-textarea');
        const viewMode = cell.querySelector('.view-mode');

        if (input && viewMode) input.value = viewMode.textContent;
        if (textarea && viewMode) textarea.value = viewMode.textContent;
    });

    row.classList.remove('editing');
}

function showNotification(message, timeout = 2000) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #34d399;
        color: white;
        padding: 12px 18px;
        border-radius: 8px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.12);
        z-index: 1200;
        transition: transform 0.25s ease, opacity 0.25s ease;
    `;

    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-8px)';
        setTimeout(() => notification.remove(), 300);
    }, timeout);
}

// Delegated click handlers so buttons without inline onclick work as well
document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-content-btn');
    if (editBtn) {
        e.preventDefault();
        enableEdit(editBtn);
        return;
    }

    const saveBtn = e.target.closest('.save-btn');
    if (saveBtn) {
        e.preventDefault();
        saveEdit(saveBtn);
        return;
    }

    const cancelBtn = e.target.closest('.cancel-btn');
    if (cancelBtn) {
        e.preventDefault();
        cancelEdit(cancelBtn);
        return;
    }
});

// Keyboard shortcuts for active editing row: Esc to cancel, Ctrl/Cmd+Enter to save
document.addEventListener('keydown', (e) => {
    const editingRow = document.querySelector('tr.editing');
    if (!editingRow) return;

    if (e.key === 'Escape') {
        const cancelBtn = editingRow.querySelector('.cancel-btn');
        if (cancelBtn) cancelEdit(cancelBtn);
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const saveBtn = editingRow.querySelector('.save-btn');
        if (saveBtn) saveEdit(saveBtn);
    }
});

// preview
const fileInputGroups = document.querySelectorAll(".file-input-group");

fileInputGroups.forEach(inputGroup => {
    const previewSelectedImg = inputGroup.querySelector(".preview-selected-img");
    const previewImg = previewSelectedImg.querySelector("img");
    const fileInput = inputGroup.querySelector("input[type='file']");

    fileInput.addEventListener("input", () => {
        const file = fileInput.value;
        const imgPath = "assets/images/uploads/"

        if (file) {
            previewImg.src = file;

            const splitFileSrc = file.split(".");

            const imgExt = splitFileSrc.length - 1;

            console.log(file)

            previewImg.src = imgPath + imgExt;

            console.log(previewImg);

            inputGroup.classList.add("img-selected");
            previewSelectedImg.classList.add("img-selected");
        }
    })
})

// importing form validation
import { setupFormValidation } from './formValidation.js';

setupFormValidation('.addSkillForm', {
    'skill-title': (input) => input.value.trim().length > 0,
    'skill-description': (input) => {
        const len = input.value.trim().length;
        return len >= 100 && len <= 200;
    },
    'skill-icon': (input) => input.files.length > 0
});

(function () {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const dropzoneMessage = document.getElementById('dropzone-message');
    const filePreview = document.getElementById('file-preview');
    const previewImage = document.getElementById('preview-image');
    const previewName = document.getElementById('preview-name');
    const previewSize = document.getElementById('preview-size');
    const removeBtn = document.getElementById('remove-file');
    const errorMessage = document.getElementById('error-message');
    const hiddenInput = document.getElementById('stack-icon-data');
    const hiddenNameInput = document.getElementById('stack-icon-name');
    const form = document.querySelector('.add-stack-form');

    let currentFile = null;

    if (dropzone === null || fileInput === null || dropzoneMessage === null || filePreview === null ||
        previewImage === null || previewName === null || previewSize === null || removeBtn === null ||
        errorMessage === null || hiddenInput === null || hiddenNameInput === null || form === null) {
        return;
    }

    // Click to open file dialog
    dropzone.addEventListener('click', function (e) {
        if (!e.target.closest('.file-preview-remove')) {
            fileInput.click();
        }
    });

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight on drag
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, function () {
            dropzone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, function () {
            dropzone.classList.remove('drag-over');
        });
    });

    // Handle dropped files
    dropzone.addEventListener('drop', function (e) {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // Handle selected files
    fileInput.addEventListener('change', function (e) {
        if (this.files.length > 0) {
            handleFile(this.files[0]);
        }
    });

    // Remove file
    removeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        removeFile();
    });

    function handleFile(file) {
        // Reset error
        errorMessage.classList.remove('active');
        errorMessage.textContent = '';

        // Validate file type
        if (!file.type.includes('svg')) {
            showError('Only SVG files are allowed.');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showError('File size must be less than 2MB.');
            return;
        }

        currentFile = file;

        // Read file
        const reader = new FileReader();
        reader.onload = function (e) {
            const fileData = e.target.result;

            // Store in hidden input
            hiddenInput.value = fileData;
            hiddenNameInput.value = file.name;

            // Show preview
            previewImage.innerHTML = `<img src="${fileData}" alt="${file.name}">`;
            previewName.textContent = file.name;
            previewSize.textContent = formatFileSize(file.size);

            // Toggle visibility
            dropzoneMessage.style.display = 'none';
            filePreview.classList.add('active');
        };
        reader.readAsDataURL(file);
    }

    function removeFile() {
        currentFile = null;
        fileInput.value = '';
        hiddenInput.value = '';
        hiddenNameInput.value = '';
        previewImage.innerHTML = '';

        // Toggle visibility
        dropzoneMessage.style.display = 'flex';
        filePreview.classList.remove('active');
        errorMessage.classList.remove('active');
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('active');
        removeFile();
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Validate stack name
        const stackName = document.getElementById('stack-name').value.trim();
        if (!stackName) {
            alert('Please enter a stack name');
            return;
        }

        // Validate file upload
        if (!currentFile) {
            showError('Please upload a stack icon');
            return;
        }

        const iconData = hiddenInput.value;
        const iconName = hiddenNameInput.value;

        console.log('Stack Name:', stackName);
        console.log('Icon Name:', iconName);
        console.log('Icon Data (first 100 chars):', iconData.substring(0, 100) + '...');

        // Create FormData for submission
        const formData = new FormData();
        formData.append('stack_name', stackName);
        formData.append('stack_icon', iconData);
        formData.append('stack_icon_name', iconName);

        // Send to server
        /*
        fetch('/api/stacks', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            alert('Stack saved successfully!');
            // Reset form
            form.reset();
            removeFile();
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error saving stack!');
        });
        */

        alert('Form submitted successfully! Check console for data.');
    });
})();


(function () {
    // Character counters
    const counters = [
        { input: 'site-title', counter: 'title-count', min: 50, max: 70 },
        { input: 'meta-description', counter: 'desc-count', min: 120, max: 160 },
        { input: 'og-title', counter: 'og-title-count', min: 60, max: 95 },
        { input: 'og-description', counter: 'og-desc-count', min: 110, max: 200 }
    ];

    counters.forEach(item => {
        const input = document.getElementById(item.input);
        const counter = document.getElementById(item.counter);

        if (input && counter) {
            input.addEventListener('input', function () {
                const length = this.value.length;
                counter.textContent = `${length} / ${item.max}`;

                counter.classList.remove('success', 'warning', 'error');

                if (length >= item.min && length <= item.max) {
                    counter.classList.add('success');
                } else if (length < item.min || length > item.max * 0.9) {
                    counter.classList.add('warning');
                }

                if (length > item.max) {
                    counter.classList.add('error');
                }
            });
        }
    });

    // OG Image Dropzone
    const ogDropzone = document.getElementById('og-dropzone');
    const ogFileInput = document.getElementById('og-file-input');
    const ogDropzoneMessage = document.getElementById('og-dropzone-message');
    const ogFilePreview = document.getElementById('og-file-preview');
    const ogPreviewImage = document.getElementById('og-preview-image');
    const ogPreviewName = document.getElementById('og-preview-name');
    const ogPreviewSize = document.getElementById('og-preview-size');
    const ogRemoveBtn = document.getElementById('og-remove-file');
    const ogHiddenInput = document.getElementById('og-image-data');
    const ogHiddenNameInput = document.getElementById('og-image-name');

    let ogCurrentFile = null;

    ogDropzone.addEventListener('click', function (e) {
        if (!e.target.closest('.file-preview-remove')) {
            ogFileInput.click();
        }
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        ogDropzone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        ogDropzone.addEventListener(eventName, function () {
            ogDropzone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        ogDropzone.addEventListener(eventName, function () {
            ogDropzone.classList.remove('drag-over');
        });
    });

    ogDropzone.addEventListener('drop', function (e) {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleOgFile(files[0]);
        }
    });

    ogFileInput.addEventListener('change', function (e) {
        if (this.files.length > 0) {
            handleOgFile(this.files[0]);
        }
    });

    ogRemoveBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        removeOgFile();
    });

    function handleOgFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        if (!validTypes.includes(file.type)) {
            alert('Only JPG, PNG, and WebP images are allowed.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB.');
            return;
        }

        ogCurrentFile = file;

        const reader = new FileReader();
        reader.onload = function (e) {
            const fileData = e.target.result;

            ogHiddenInput.value = fileData;
            ogHiddenNameInput.value = file.name;

            ogPreviewImage.innerHTML = `<img src="${fileData}" alt="${file.name}">`;
            ogPreviewName.textContent = file.name;
            ogPreviewSize.textContent = formatFileSize(file.size);

            ogDropzoneMessage.style.display = 'none';
            ogFilePreview.classList.add('active');
        };
        reader.readAsDataURL(file);
    }

    function removeOgFile() {
        ogCurrentFile = null;
        ogFileInput.value = '';
        ogHiddenInput.value = '';
        ogHiddenNameInput.value = '';
        ogPreviewImage.innerHTML = '';

        ogDropzoneMessage.style.display = 'flex';
        ogFilePreview.classList.remove('active');
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Select styling
    const form = document.querySelector('.seo-metadata-form');
    const selects = form.querySelectorAll('select');

    selects.forEach(select => {
        select.style.display = 'block';
        select.style.height = '50px';
        select.style.padding = '10px';
        select.style.width = '100%';
        select.style.background = 'transparent';
        select.style.color = 'var(--myadmin-body-color)';
        select.style.border = '1px solid var(--myadmin-border-color)';
        select.style.borderRadius = '4px';
        select.style.outline = 'none';
        select.style.cursor = 'pointer';
        select.style.fontSize = '16px';
    });

    // Form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const seoData = {};

        for (let [key, value] of formData.entries()) {
            seoData[key] = value;
        }

        console.log('SEO Metadata:', seoData);

        /*
        fetch('/api/seo-settings', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            alert('SEO settings saved successfully!');
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error saving SEO settings!');
        });
        */

        alert('SEO settings saved successfully! Check console for data.');
    });
})();