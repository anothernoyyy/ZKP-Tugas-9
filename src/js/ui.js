/**
 * ============================================================
 *  UI Module - Toast Notifications, Loading, Helpers
 * ============================================================
 */

// ============================================================
//  Toast Notifications
// ============================================================

const TOAST_ICONS = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
};

const TOAST_TITLES = {
    success: 'Berhasil',
    error: 'Error',
    warning: 'Peringatan',
    info: 'Info',
};

/**
 * Tampilkan toast notification
 * @param {string} message - Pesan
 * @param {'success'|'error'|'warning'|'info'} type - Tipe
 * @param {number} duration - Durasi dalam ms (default 4000)
 */
export function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${TOAST_ICONS[type]}</span>
        <div class="toast-body">
            <div class="toast-title">${TOAST_TITLES[type]}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============================================================
//  Loading Overlay
// ============================================================

/**
 * Tampilkan loading overlay
 * @param {string} text - Teks loading
 */
export function showLoading(text = 'Processing...') {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    if (overlay) {
        overlay.classList.remove('hidden');
        if (loadingText) loadingText.textContent = text;
    }
}

/**
 * Sembunyikan loading overlay
 */
export function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// ============================================================
//  Form Validation
// ============================================================

/**
 * Validasi form input
 * @param {Object} fields - { fieldName: { value, rules } }
 * @returns {{ valid: boolean, errors: Object }}
 */
export function validateForm(fields) {
    const errors = {};

    for (const [name, config] of Object.entries(fields)) {
        const { value, rules } = config;

        if (rules.required && (!value || value.trim() === '')) {
            errors[name] = `${name} wajib diisi`;
            continue;
        }

        if (rules.minLength && value.length < rules.minLength) {
            errors[name] = `${name} minimal ${rules.minLength} karakter`;
            continue;
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            errors[name] = `${name} maksimal ${rules.maxLength} karakter`;
            continue;
        }

        if (rules.match && value !== rules.match.value) {
            errors[name] = rules.match.message || `${name} tidak cocok`;
            continue;
        }

        if (rules.pattern && !rules.pattern.test(value)) {
            errors[name] = rules.patternMessage || `${name} format tidak valid`;
        }
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}

/**
 * Tampilkan error pada form input
 */
export function showFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.classList.add('error');

    // Remove existing error message
    const existingError = input.parentElement.querySelector('.form-error');
    if (existingError) existingError.remove();

    // Add error message
    const errorEl = document.createElement('div');
    errorEl.className = 'form-error';
    errorEl.textContent = message;
    input.parentElement.appendChild(errorEl);
}

/**
 * Hapus semua error dari form
 */
export function clearFormErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.querySelectorAll('.form-input.error').forEach((el) => {
        el.classList.remove('error');
    });
    form.querySelectorAll('.form-error').forEach((el) => {
        el.remove();
    });
}

// ============================================================
//  Formatting Helpers
// ============================================================

/**
 * Potong alamat wallet (0x1234...5678)
 */
export function shortenAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format timestamp ke tanggal Indonesia
 */
export function formatTimestamp(timestamp) {
    if (!timestamp || timestamp === 0) return '-';
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format angka besar ke string readable
 */
export function formatBigNumber(bn) {
    const str = bn.toString();
    if (str.length <= 12) return str;
    return `${str.slice(0, 6)}...${str.slice(-6)}`;
}

// ============================================================
//  Session Storage (untuk conventional auth)
// ============================================================

const SESSION_KEY = 'zkp_auth_session';
const USERS_KEY = 'zkp_auth_users';

/**
 * Simpan session user
 */
export function saveSession(userData) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData));
}

/**
 * Ambil session user
 */
export function getSession() {
    const data = sessionStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
}

/**
 * Hapus session
 */
export function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Simpan user ke localStorage (conventional method)
 */
export function saveConventionalUser(user) {
    const users = getConventionalUsers();
    users[user.username] = user;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Ambil semua conventional users
 */
export function getConventionalUsers() {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : {};
}

/**
 * Hash password sederhana (untuk conventional method only)
 * CATATAN: Ini BUKAN ZKP - ini hanya untuk demo metode konvensional
 */
export async function simpleHash(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
