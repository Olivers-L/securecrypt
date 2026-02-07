from flask import Flask, render_template, request, jsonify, session
from crypto import CryptoManager
import os
from datetime import datetime
import json

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-please-change')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

@app.route('/')
def index():
    """Home page"""
    session_id = session.get('session_id', 'new_user')
    return render_template('index.html', session_id=session_id)

@app.route('/about')
def about():
    """About page"""
    return render_template('about.html')

@app.route('/api/generate-key', methods=['POST'])
def generate_key():
    """Generate a new encryption key"""
    try:
        key = CryptoManager.generate_key()
        return jsonify({
            'success': True,
            'key': key,
            'message': '🔑 Key generated successfully!',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/generate-password', methods=['POST'])
def generate_password():
    """Generate a secure password"""
    try:
        data = request.json
        length = data.get('length', 16)
        password = CryptoManager.generate_password(length)
        return jsonify({
            'success': True,
            'password': password,
            'message': '🔐 Password generated!'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/encrypt', methods=['POST'])
def encrypt():
    """Encrypt text"""
    try:
        data = request.json
        text = data.get('text', '').strip()
        key = data.get('key', '').strip()
        
        if not text:
            return jsonify({
                'success': False,
                'error': 'Please enter text to encrypt'
            }), 400
        
        if not key:
            return jsonify({
                'success': False,
                'error': 'Encryption key is required'
            }), 400
        
        encrypted = CryptoManager.encrypt_text(text, key)
        
        return jsonify({
            'success': True,
            'encrypted': encrypted,
            'message': '✅ Text encrypted successfully!',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/decrypt', methods=['POST'])
def decrypt():
    """Decrypt text"""
    try:
        data = request.json
        encrypted = data.get('encrypted', '').strip()
        key = data.get('key', '').strip()
        
        if not encrypted:
            return jsonify({
                'success': False,
                'error': 'Please enter text to decrypt'
            }), 400
        
        if not key:
            return jsonify({
                'success': False,
                'error': 'Decryption key is required'
            }), 400
        
        decrypted = CryptoManager.decrypt_text(encrypted, key)
        
        return jsonify({
            'success': True,
            'decrypted': decrypted,
            'message': '✅ Text decrypted successfully!',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': '❌ Decryption failed. Invalid key or corrupted text.'
        }), 400

@app.route('/api/derive-key', methods=['POST'])
def derive_key():
    """Derive key from password"""
    try:
        data = request.json
        password = data.get('password', '').strip()
        
        if not password:
            return jsonify({
                'success': False,
                'error': 'Password is required'
            }), 400
        
        derived_key = CryptoManager.derive_key_from_password(password)
        
        return jsonify({
            'success': True,
            'derived_key': derived_key,
            'message': '🔑 Key derived from password!',
            'note': 'Save this key securely. You need it for decryption.'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'SecureCrypt API',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.errorhandler(404)
def not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)