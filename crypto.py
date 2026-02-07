import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
from cryptography.hazmat.primitives import hashes
import secrets
import string

KEY_SIZE = 32
NONCE_SIZE = 12
SALT_SIZE = 16

class CryptoManager:
    @staticmethod
    def generate_key():
        """Generate a secure random key"""
        return base64.urlsafe_b64encode(os.urandom(KEY_SIZE)).decode()
    
    @staticmethod
    def generate_password(length=16):
        """Generate a secure password"""
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        return ''.join(secrets.choice(alphabet) for _ in range(length))
    
    @staticmethod
    def encrypt_text(text, key_b64):
        """Encrypt text using AES-GCM"""
        try:
            key = base64.urlsafe_b64decode(key_b64)
            nonce = os.urandom(NONCE_SIZE)
            aes = AESGCM(key)
            
            encrypted = aes.encrypt(nonce, text.encode(), None)
            return base64.urlsafe_b64encode(nonce + encrypted).decode()
        except Exception as e:
            raise Exception(f"Encryption failed: {str(e)}")
    
    @staticmethod
    def decrypt_text(text_b64, key_b64):
        """Decrypt text using AES-GCM"""
        try:
            key = base64.urlsafe_b64decode(key_b64)
            data = base64.urlsafe_b64decode(text_b64)
            
            if len(data) < NONCE_SIZE:
                raise ValueError("Invalid encrypted data")
                
            nonce = data[:NONCE_SIZE]
            encrypted = data[NONCE_SIZE:]
            aes = AESGCM(key)
            
            return aes.decrypt(nonce, encrypted, None).decode()
        except Exception as e:
            raise Exception(f"Decryption failed: {str(e)}")
    
    @staticmethod
    def derive_key_from_password(password, salt=None):
        """Derive key from password using PBKDF2"""
        if salt is None:
            salt = os.urandom(SALT_SIZE)
        
        kdf = PBKDF2(
            algorithm=hashes.SHA256(),
            length=KEY_SIZE,
            salt=salt,
            iterations=310000,  # OWASP recommended
        )
        key = kdf.derive(password.encode())
        return base64.urlsafe_b64encode(salt + key).decode()