// DOM Elements
const keyInput = document.getElementById('key-input');
const plaintextInput = document.getElementById('plaintext-input');
const encryptedOutput = document.getElementById('encrypted-output');
const encryptedInput = document.getElementById('encrypted-input');
const decryptedOutput = document.getElementById('decrypted-output');
const passwordInput = document.getElementById('password-input');

// Buttons
const generateKeyBtn = document.getElementById('generate-key');
const copyKeyBtn = document.getElementById('copy-key');
const clearKeyBtn = document.getElementById('clear-key');
const encryptBtn = document.getElementById('encrypt-btn');
const decryptBtn = document.getElementById('decrypt-btn');
const copyEncryptedBtn = document.getElementById('copy-encrypted');
const clearEncryptedBtn = document.getElementById('clear-encrypted');
const copyDecryptedBtn = document.getElementById('copy-decrypted');
const clearDecryptedBtn = document.getElementById('clear-decrypted');
const generateFromPasswordBtn = document.getElementById('generate-from-password');
const themeToggleBtn = document.getElementById('theme-toggle');
const viewSourceBtn = document.getElementById('view-source');
const quickGenerateBtn = document.getElementById('quick-generate');
const sampleEncryptBtn = document.getElementById('sample-encrypt');
const clearAllBtn = document.getElementById('clear-all');

// Character counters
const plaintextCount = document.getElementById('plaintext-count');

// API Endpoints
const API = {
    generateKey: '/api/generate-key',
    generatePassword: '/api/generate-password',
    encrypt: '/api/encrypt',
    decrypt: '/api/decrypt',
    deriveKey: '/api/derive-key',
    health: '/api/health'
};

// Toast System
class Toast {
    static show(message, type = 'info', duration = 5000) {
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
const style = document.createElement('style');
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

function copyToClipboard(text, elementName = 'text') {
    navigator.clipboard.writeText(text)
        .then(() => {
            Toast.show(`${elementName} copied to clipboard!`, 'success');
        })
        .catch(err => {
            console.error('Copy failed:', err);
            Toast.show('Failed to copy to clipboard', 'error');
        });
}

function clearTextarea(textarea) {
    textarea.value = '';
    textarea.dispatchEvent(new Event('input'));
}

function updateCharCount() {
    const count = plaintextInput.value.length;
    plaintextCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
}

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    
    Toast.show(`Switched to ${newTheme} theme`, 'info');
}

function updateThemeIcon(theme) {
    const icon = themeToggleBtn.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
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
    if (keyInput.value.trim()) {
        copyToClipboard(keyInput.value, 'Key');
    } else {
        Toast.show('No key to copy', 'error');
    }
});

clearKeyBtn.addEventListener('click', () => {
    clearTextarea(keyInput);
    Toast.show('Key cleared', 'info');
});

encryptBtn.addEventListener('click', async () => {
    const text = plaintextInput.value.trim();
    const key = keyInput.value.trim();
    
    if (!text) {
        Toast.show('Please enter text to encrypt', 'error');
        return;
    }
    
    if (!key) {
        Toast.show('Please generate or enter an encryption key', 'error');
        return;
    }
    
    try {
        const result = await apiCall(API.encrypt, 'POST', { text, key });
        encryptedOutput.value = result.encrypted;
        Toast.show(result.message, 'success');
    } catch (error) {
        // Error handled by apiCall
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
        const result = await apiCall(API.decrypt, 'POST', { encrypted, key });
        decryptedOutput.value = result.decrypted;
        Toast.show(result.message, 'success');
    } catch (error) {
        // Error handled by apiCall
    }
});

copyEncryptedBtn.addEventListener('click', () => {
    if (encryptedOutput.value.trim()) {
        copyToClipboard(encryptedOutput.value, 'Encrypted text');
    } else {
        Toast.show('No encrypted text to copy', 'error');
    }
});

clearEncryptedBtn.addEventListener('click', () => {
    clearTextarea(encryptedOutput);
    Toast.show('Encrypted text cleared', 'info');
});

copyDecryptedBtn.addEventListener('click', () => {
    if (decryptedOutput.value.trim()) {
        copyToClipboard(decryptedOutput.value, 'Decrypted text');
    } else {
        Toast.show('No decrypted text to copy', 'error');
    }
});

clearDecryptedBtn.addEventListener('click', () => {
    clearTextarea(decryptedOutput);
    Toast.show('Decrypted text cleared', 'info');
});

generateFromPasswordBtn.addEventListener('click', async () => {
    const password = passwordInput.value.trim();
    
    if (!password) {
        Toast.show('Please enter a password', 'error');
        return;
    }
    
    if (password.length < 8) {
        Toast.show('Password should be at least 8 characters', 'warning');
        return;
    }
    
    try {
        const result = await apiCall(API.deriveKey, 'POST', { password });
        keyInput.value = result.derived_key;
        Toast.show(result.message, 'success');
    } catch (error) {
        // Error handled by apiCall
    }
});

themeToggleBtn.addEventListener('click', toggleTheme);

viewSourceBtn.addEventListener('click', () => {
    window.open('https://github.com/yourusername/securecrypt', '_blank');
});

quickGenerateBtn.addEventListener('click', async () => {
    try {
        const result = await apiCall(API.generateKey);
        keyInput.value = result.key;
        plaintextInput.value = 'Hello, this is a test message!';
        plaintextInput.dispatchEvent(new Event('input'));
        Toast.show('Quick setup complete!', 'success');
    } catch (error) {
        // Error handled by apiCall
    }
});

sampleEncryptBtn.addEventListener('click', async () => {
    if (!keyInput.value.trim()) {
        Toast.show('Please generate a key first', 'error');
        return;
    }
    
    const sampleText = `This is a sample secret message for testing SecureCrypt.

Features:
• AES-GCM encryption
• Secure key generation
• Web-based interface
• Open source

Try encrypting your own messages!`;
    
    plaintextInput.value = sampleText;
    plaintextInput.dispatchEvent(new Event('input'));
    
    try {
        const result = await apiCall(API.encrypt, 'POST', { 
            text: sampleText, 
            key: keyInput.value 
        });
        encryptedOutput.value = result.encrypted;
        Toast.show('Sample encryption complete!', 'success');
    } catch (error) {
        // Error handled by apiCall
    }
});

clearAllBtn.addEventListener('click', () => {
    clearTextarea(keyInput);
    clearTextarea(plaintextInput);
    clearTextarea(encryptedOutput);
    clearTextarea(encryptedInput);
    clearTextarea(decryptedOutput);
    passwordInput.value = '';
    Toast.show('All fields cleared', 'info');
});

// Input Event Listeners
plaintextInput.addEventListener('input', updateCharCount);

// Auto-copy on click for result fields
[encryptedOutput, decryptedOutput].forEach(textarea => {
    textarea.addEventListener('click', function() {
        if (this.value.trim()) {
            this.select();
            copyToClipboard(this.value, 'Text');
        }
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateCharCount();
    
    // Health check on load
    fetch(API.health)
        .then(response => response.json())
        .then(data => {
            console.log('API Health:', data);
        })
        .catch(err => {
            console.warn('Health check failed:', err);
        });
    
    Toast.show('SecureCrypt loaded successfully!', 'success', 2000);
});