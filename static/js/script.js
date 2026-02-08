// DOM Elements
const keyInput = document.getElementById('key-input');
const plaintextInput = document.getElementById('plaintext-input');
const encryptedOutput = document.getElementById('encrypted-output');
const encryptedInput = document.getElementById('encrypted-input');
const decryptedOutput = document.getElementById('decrypted-output');

// Buttons
const generateKeyBtn = document.getElementById('generate-key');
const copyKeyBtn = document.getElementById('copy-key');
const encryptBtn = document.getElementById('encrypt-btn');
const decryptBtn = document.getElementById('decrypt-btn');
const copyEncryptedBtn = document.getElementById('copy-encrypted');
const copyDecryptedBtn = document.getElementById('copy-decrypted');

// Character counter
const plaintextCount = document.getElementById('plaintext-count');

// API Endpoints
const API = {
    generateKey: '/api/generate-key',
    encrypt: '/api/encrypt',
    decrypt: '/api/decrypt'
};

// Toast System
class Toast {
    static show(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
        
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
        
        // Manual dismiss on click
        toast.addEventListener('click', () => toast.remove());
    }
}

// Add slideOut animation
if (!document.querySelector('#toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    `;
    document.head.appendChild(style);
}

// FIXED: COPY FUNCTION - Works on all browsers
function copyToClipboard(text, elementName = 'text') {
    if (!text || text.trim() === '') {
        Toast.show(`No ${elementName} to copy`, 'error');
        return false;
    }
    
    // Method 1: Modern Clipboard API (works in HTTPS/localhost)
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text.trim())
            .then(() => {
                Toast.show(`${elementName} copied to clipboard!`, 'success');
                return true;
            })
            .catch(err => {
                console.log('Modern clipboard failed, trying fallback:', err);
                return fallbackCopy(text, elementName);
            });
    } else {
        // Method 2: Fallback for HTTP or older browsers
        return fallbackCopy(text, elementName);
    }
}

// Fallback copy method
function fallbackCopy(text, elementName) {
    const textarea = document.createElement('textarea');
    textarea.value = text.trim();
    
    // Make it invisible
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    
    // Select and copy
    textarea.focus();
    textarea.select();
    
    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (successful) {
            Toast.show(`${elementName} copied to clipboard!`, 'success');
            return true;
        } else {
            Toast.show(`Failed to copy ${elementName}`, 'error');
            return false;
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        document.body.removeChild(textarea);
        Toast.show(`Could not copy ${elementName}`, 'error');
        return false;
    }
}

// Utility Functions
async function apiCall(endpoint, method = 'POST', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(endpoint, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'API request failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        Toast.show(error.message, 'error');
        throw error;
    }
}

function clearTextarea(textarea) {
    if (textarea) {
        textarea.value = '';
        if (textarea === plaintextInput) {
            updateCharCount();
        }
    }
}

function updateCharCount() {
    const count = plaintextInput.value.length;
    plaintextCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
}

// Event Listeners
generateKeyBtn.addEventListener('click', async () => {
    try {
        const result = await apiCall(API.generateKey);
        keyInput.value = result.key;
        Toast.show(result.message, 'success');
    } catch (error) {
        // Error handled by apiCall
    }
});

copyKeyBtn.addEventListener('click', () => {
    copyToClipboard(keyInput.value, 'Key');
});

encryptBtn.addEventListener('click', async () => {
    const text = plaintextInput.value.trim();
    const key = keyInput.value.trim();
    
    if (!text) {
        Toast.show('Please enter text to encrypt', 'error');
        return;
    }
    
    if (!key) {
        Toast.show('Please generate or enter an encryption key first', 'error');
        return;
    }
    
    try {
        encryptBtn.disabled = true;
        encryptBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Encrypting...';
        
        const result = await apiCall(API.encrypt, 'POST', { text, key });
        encryptedOutput.value = result.encrypted;
        Toast.show(result.message, 'success');
    } catch (error) {
        // Error handled by apiCall
    } finally {
        encryptBtn.disabled = false;
        encryptBtn.innerHTML = '<i class="fas fa-lock"></i> Encrypt Text';
    }
});

decryptBtn.addEventListener('click', async () => {
    const encrypted = encryptedInput.value.trim();
    const key = keyInput.value.trim();
    
    if (!encrypted) {
        Toast.show('Please enter text to decrypt', 'error');
        return;
    }
    
    if (!key) {
        Toast.show('Please enter the decryption key', 'error');
        return;
    }
    
    try {
        decryptBtn.disabled = true;
        decryptBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Decrypting...';
        
        const result = await apiCall(API.decrypt, 'POST', { encrypted, key });
        decryptedOutput.value = result.decrypted;
        Toast.show(result.message, 'success');
    } catch (error) {
        // Error handled by apiCall
    } finally {
        decryptBtn.disabled = false;
        decryptBtn.innerHTML = '<i class="fas fa-unlock"></i> Decrypt Text';
    }
});

copyEncryptedBtn.addEventListener('click', () => {
    copyToClipboard(encryptedOutput.value, 'Encrypted text');
});

copyDecryptedBtn.addEventListener('click', () => {
    copyToClipboard(decryptedOutput.value, 'Decrypted text');
});

// Auto-select text on click for easier copying
[keyInput, encryptedOutput, decryptedOutput].forEach(textarea => {
    textarea.addEventListener('click', function() {
        if (this.value && this.value.trim()) {
            this.select();
        }
    });
});

// Input Event Listeners
plaintextInput.addEventListener('input', updateCharCount);

// Clear buttons if they exist
document.querySelectorAll('.btn-danger').forEach(btn => {
    btn.addEventListener('click', function() {
        const targetId = this.dataset.target;
        const textarea = document.getElementById(targetId);
        if (textarea) {
            clearTextarea(textarea);
        }
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCharCount();
    
    // Test toast on load
    setTimeout(() => {
        Toast.show('SecureCrypt ready for encryption', 'success', 2000);
    }, 500);
    
    // Add auto-clear on page refresh warning
    window.addEventListener('beforeunload', () => {
        if (keyInput.value || plaintextInput.value || encryptedInput.value) {
            return 'You have unsaved data. Are you sure you want to leave?';
        }
    });
});