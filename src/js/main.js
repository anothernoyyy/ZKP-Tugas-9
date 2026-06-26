/**
 * ============================================================
 *  Main App - Router, Page Templates & Event Handlers
 *  Tabbed Widget Layout
 * ============================================================
 */

import {
    showToast, showLoading, hideLoading, validateForm, showFieldError, clearFormErrors,
    saveSession, getSession, clearSession, saveConventionalUser, getConventionalUsers, simpleHash,
    shortenAddress, formatTimestamp,
} from './ui.js';

import { generateProof, formatProofForContract, checkZKPArtifacts } from './zkp.js';

import {
    connectMetaMask, isMetaMaskInstalled, getCurrentAccount, isConnected,
    registerOnChain, loginOnChain, getUserFromChain, setupMetaMaskListeners, getNetworkInfo
} from './blockchain.js';

import { AUTH_ADDRESS } from './config.js';

// ============================================================
//  Terminal Logger
// ============================================================

function clearTerminal() {
    const term = document.getElementById('console-output');
    if (term) {
        term.innerHTML = '';
        term.classList.remove('active');
    }
}

function logTerminal(msg, type = 'info') {
    const term = document.getElementById('console-output');
    if (term) {
        term.classList.add('active');
        const p = document.createElement('p');
        p.className = `term-${type}`;
        p.textContent = `> ${msg}`;
        term.appendChild(p);
        term.scrollTop = term.scrollHeight; // auto scroll
    }
}

// ============================================================
//  UI Templates (Widget Shell)
// ============================================================

function widgetShell(method, action, content) {
    return `
        <div class="auth-widget">
            <div class="widget-header">
                <div class="brand">
                    <div class="brand-icon">NA</div>
                    <h1>Nazril Azzam</h1>
                </div>
                
                <div class="method-tabs">
                    <a href="#/konvensional/login" class="method-tab ${method === 'konvensional' ? 'active' : ''}">Konvensional</a>
                    <a href="#/zkp/login" class="method-tab ${method === 'zkp' ? 'active' : ''}">Zero-Knowledge</a>
                </div>

                <div class="action-tabs">
                    <a href="#/${method}/login" class="action-tab ${action === 'login' ? 'active' : ''}">Login</a>
                    <a href="#/${method}/register" class="action-tab ${action === 'register' ? 'active' : ''}">Register</a>
                </div>
            </div>
            
            <div class="widget-body">
                ${content}
            </div>
        </div>
    `;
}

// ============================================================
//  Page Contents
// ============================================================

function konvensionalRegisterPage() {
    const form = `
        <form id="form-conv-register">
            <div class="form-group">
                <label class="form-label" for="conv-reg-name">Nama Lengkap</label>
                <input class="form-input" type="text" id="conv-reg-name" placeholder="John Doe">
            </div>
            <div class="form-group">
                <label class="form-label" for="conv-reg-username">Username</label>
                <input class="form-input" type="text" id="conv-reg-username" placeholder="johndoe">
            </div>
            <div class="form-group">
                <label class="form-label" for="conv-reg-password">Password</label>
                <input class="form-input" type="password" id="conv-reg-password" placeholder="••••••••">
            </div>
            <div class="form-group">
                <label class="form-label" for="conv-reg-confirm">Konfirmasi Password</label>
                <input class="form-input" type="password" id="conv-reg-confirm" placeholder="••••••••">
            </div>
            <button type="submit" class="btn btn-primary">Daftar Akun Konvensional</button>
        </form>
    `;
    return widgetShell('konvensional', 'register', form);
}

function konvensionalLoginPage() {
    const form = `
        <form id="form-conv-login">
            <div class="form-group">
                <label class="form-label" for="conv-login-username">Username</label>
                <input class="form-input" type="text" id="conv-login-username" placeholder="johndoe">
            </div>
            <div class="form-group">
                <label class="form-label" for="conv-login-password">Password</label>
                <input class="form-input" type="password" id="conv-login-password" placeholder="••••••••">
            </div>
            <button type="submit" class="btn btn-primary">Masuk</button>
        </form>
    `;
    return widgetShell('konvensional', 'login', form);
}

function zkpRegisterPage() {
    const walletStatus = isConnected()
        ? `<button type="button" class="btn btn-wallet connected" id="btn-connect-wallet">
               <span class="status-dot"></span> ${shortenAddress(getCurrentAccount())}
           </button>`
        : `<button type="button" class="btn btn-wallet" id="btn-connect-wallet">
               Hubungkan MetaMask
           </button>`;

    const form = `
        ${walletStatus}
        <form id="form-zkp-register">
            <div class="form-group">
                <label class="form-label" for="zkp-reg-name">Nama Lengkap</label>
                <input class="form-input" type="text" id="zkp-reg-name" placeholder="John Doe">
            </div>
            <div class="form-group">
                <label class="form-label" for="zkp-reg-username">Username</label>
                <input class="form-input" type="text" id="zkp-reg-username" placeholder="johndoe">
            </div>
            <div class="form-group">
                <label class="form-label" for="zkp-reg-password">Password</label>
                <input class="form-input" type="password" id="zkp-reg-password" placeholder="••••••••">
                <div class="form-hint">Akan di-hash lokal, tidak dikirim ke blockchain.</div>
            </div>
            <div class="form-group">
                <label class="form-label" for="zkp-reg-confirm">Konfirmasi Password</label>
                <input class="form-input" type="password" id="zkp-reg-confirm" placeholder="••••••••">
            </div>
            <button type="submit" class="btn btn-primary">Registrasi di Blockchain</button>
        </form>
        <div id="console-output" class="terminal-box"></div>
    `;
    return widgetShell('zkp', 'register', form);
}

function zkpLoginPage() {
    const walletStatus = isConnected()
        ? `<button type="button" class="btn btn-wallet connected" id="btn-connect-wallet">
               <span class="status-dot"></span> ${shortenAddress(getCurrentAccount())}
           </button>`
        : `<button type="button" class="btn btn-wallet" id="btn-connect-wallet">
               Hubungkan MetaMask
           </button>`;

    const form = `
        ${walletStatus}
        <form id="form-zkp-login">
            <div class="form-group">
                <label class="form-label" for="zkp-login-username">Username</label>
                <input class="form-input" type="text" id="zkp-login-username" placeholder="johndoe">
            </div>
            <div class="form-group">
                <label class="form-label" for="zkp-login-password">Password</label>
                <input class="form-input" type="password" id="zkp-login-password" placeholder="••••••••">
            </div>
            <button type="submit" class="btn btn-primary">Generate Proof & Login</button>
        </form>
        <div id="console-output" class="terminal-box"></div>
    `;
    return widgetShell('zkp', 'login', form);
}

// ============================================================
//  Dashboard
// ============================================================

function dashboardPage(user) {
    const isZkp = user.method === 'zkp';
    
    return `
        <div class="dashboard-widget" style="max-width: 700px;">
            <div class="dash-header">
                <div class="brand">
                    <div class="brand-icon">NA</div>
                    <h1>Nazril Azzam</h1>
                </div>
                <button class="btn-logout" id="btn-logout">Keluar (Logout)</button>
            </div>

            <div style="background: var(--bg-input); padding: 24px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 24px; display: flex; gap: 16px; align-items: flex-start;">
                <div style="background: var(--brand-light); color: var(--brand-primary); padding: 12px; border-radius: var(--radius-sm);">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </div>
                <div>
                    <h2 style="font-size: 1.2rem; font-weight: 700; color: var(--text-heading); margin-bottom: 8px;">Selamat Datang, ${user.username || user.name}!</h2>
                    <p style="color: var(--text-body); font-size: 0.9rem;">Anda berhasil masuk dengan verifikasi ${isZkp ? 'Zero-Knowledge Proof di blockchain Sepolia' : 'Konvensional'}.</p>
                </div>
            </div>

            <div style="border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 24px;">
                <h3 style="font-size: 1rem; font-weight: 700; color: var(--text-heading); margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
                    Detail Akun On-Chain
                </h3>
                
                <div class="info-list" style="gap: 0;">
                    <div class="info-item" style="border: none; border-bottom: 1px solid var(--border-subtle); border-radius: 0; padding: 16px 0;">
                        <span class="info-label">Nama Lengkap</span>
                        <span class="info-value">${user.name || user.username}</span>
                    </div>
                    <div class="info-item" style="border: none; border-bottom: 1px solid var(--border-subtle); border-radius: 0; padding: 16px 0;">
                        <span class="info-label">Username</span>
                        <span class="info-value">${user.username}</span>
                    </div>
                    <div class="info-item" style="border: none; border-bottom: 1px solid var(--border-subtle); border-radius: 0; padding: 16px 0;">
                        <span class="info-label">Metode Registrasi</span>
                        <span class="badge ${isZkp ? 'badge-zkp' : 'badge-conv'}">${isZkp ? 'Zero-Knowledge Proof' : 'Konvensional'}</span>
                    </div>
                    ${isZkp ? `
                    <div class="info-item" style="border: none; border-bottom: 1px solid var(--border-subtle); border-radius: 0; padding: 16px 0;">
                        <span class="info-label">Jaringan</span>
                        <span class="badge" style="background: var(--brand-light); color: var(--brand-primary);">Sepolia Testnet</span>
                    </div>
                    <div class="info-item" style="border: none; padding: 16px 0;">
                        <span class="info-label">Smart Contract</span>
                        <span class="info-value mono">${shortenAddress(AUTH_ADDRESS)}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// ============================================================
//  Router
// ============================================================

function getRoute() {
    const hash = window.location.hash || '#/';
    return hash.replace('#', '');
}

function navigate(route) {
    window.location.hash = `#${route}`;
}

function renderPage() {
    const app = document.getElementById('app');
    if (!app) return;

    let route = getRoute();
    if (route === '/' || route === '') {
        navigate('/konvensional/login');
        return;
    }

    const session = getSession();
    if (route.includes('/dashboard') && !session) {
        navigate('/konvensional/login');
        return;
    }

    let html = '';
    switch (route) {
        case '/konvensional/register': html = konvensionalRegisterPage(); break;
        case '/konvensional/login': html = konvensionalLoginPage(); break;
        case '/zkp/register': html = zkpRegisterPage(); break;
        case '/zkp/login': html = zkpLoginPage(); break;
        case '/konvensional/dashboard': 
        case '/zkp/dashboard': 
            html = dashboardPage(session || {}); break;
        default: html = konvensionalLoginPage(); break;
    }

    app.innerHTML = html;
    bindEvents(route);
}

// ============================================================
//  Event Bindings
// ============================================================

function bindEvents(route) {
    if (route === '/konvensional/register') bindConvRegisterEvents();
    if (route === '/konvensional/login') bindConvLoginEvents();
    if (route === '/zkp/register') bindZkpRegisterEvents();
    if (route === '/zkp/login') bindZkpLoginEvents();
    if (route.includes('/dashboard')) {
        document.getElementById('btn-logout')?.addEventListener('click', () => {
            clearSession();
            navigate('/konvensional/login');
        });
    }
}

// --- Konvensional ---
function bindConvRegisterEvents() {
    document.getElementById('form-conv-register')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFormErrors('form-conv-register');

        const name = document.getElementById('conv-reg-name').value.trim();
        const username = document.getElementById('conv-reg-username').value.trim();
        const password = document.getElementById('conv-reg-password').value;
        const confirm = document.getElementById('conv-reg-confirm').value;

        const { valid, errors } = validateForm({
            name: { value: name, rules: { required: true } },
            username: { value: username, rules: { required: true, minLength: 3 } },
            password: { value: password, rules: { required: true, minLength: 6 } },
            confirm: { value: confirm, rules: { required: true, match: { value: password, message: 'Tidak cocok' } } },
        });

        if (!valid) {
            for (const [field, msg] of Object.entries(errors)) showFieldError(`conv-reg-${field}`, msg);
            return;
        }

        const users = getConventionalUsers();
        if (users[username]) {
            showFieldError('conv-reg-username', 'Username sudah terdaftar');
            return;
        }

        showLoading('Menyimpan data...');
        try {
            const passwordHash = await simpleHash(password);
            saveConventionalUser({ name, username, passwordHash, method: 'konvensional' });
            showToast('Registrasi berhasil!', 'success');
            setTimeout(() => navigate('/konvensional/login'), 1000);
        } catch (err) {
            showToast(err.message, 'error');
        } finally { hideLoading(); }
    });
}

function bindConvLoginEvents() {
    document.getElementById('form-conv-login')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFormErrors('form-conv-login');

        const username = document.getElementById('conv-login-username').value.trim();
        const password = document.getElementById('conv-login-password').value;

        if (!username) { showFieldError('conv-login-username', 'Wajib diisi'); return; }
        if (!password) { showFieldError('conv-login-password', 'Wajib diisi'); return; }

        showLoading('Memverifikasi...');
        const users = getConventionalUsers();
        const user = users[username];

        if (!user || await simpleHash(password) !== user.passwordHash) {
            hideLoading();
            showFieldError('conv-login-password', 'Username/Password salah');
            return;
        }

        saveSession(user);
        hideLoading();
        navigate('/konvensional/dashboard');
    });
}

// --- ZKP ---
function bindZkpRegisterEvents() {
    document.getElementById('btn-connect-wallet')?.addEventListener('click', async () => {
        try {
            await connectMetaMask();
            renderPage(); 
        } catch (err) { showToast(err.message, 'error'); }
    });

    document.getElementById('form-zkp-register')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFormErrors('form-zkp-register');
        clearTerminal();

        const name = document.getElementById('zkp-reg-name').value.trim();
        const username = document.getElementById('zkp-reg-username').value.trim();
        const password = document.getElementById('zkp-reg-password').value;
        const confirm = document.getElementById('zkp-reg-confirm').value;

        if (!isConnected()) { showToast('Hubungkan MetaMask dahulu', 'error'); return; }
        
        const { valid, errors } = validateForm({
            name: { value: name, rules: { required: true } },
            username: { value: username, rules: { required: true, minLength: 3 } },
            password: { value: password, rules: { required: true, minLength: 6 } },
            confirm: { value: confirm, rules: { match: { value: password, message: 'Tidak cocok' } } },
        });

        if (!valid) {
            for (const [field, msg] of Object.entries(errors)) showFieldError(`zkp-reg-${field}`, msg);
            return;
        }

        try {
            logTerminal('Mulai proses Registrasi ZKP...', 'info');
            
            const netInfo = await getNetworkInfo();
            if (netInfo) {
                logTerminal(`Jaringan terdeteksi: ${netInfo.name} (Chain ID: ${netInfo.chainId})`, 'accent');
                logTerminal(`Wallet Address: ${getCurrentAccount()}`, 'info');
            }

            logTerminal('Mengonversi password ke format BigInt & Poseidon hash...', 'info');
            const { commitment } = await generateProof(password);
            logTerminal(`Commitment Hash berhasil dibuat: ${commitment.substring(0,20)}...`, 'success');

            logTerminal('Mengirim transaksi pendaftaran ke Smart Contract di Sepolia...', 'info');
            const receipt = await registerOnChain(username, commitment);

            logTerminal(`Transaksi berhasil dikonfirmasi! Block: ${receipt.blockNumber}`, 'success');
            logTerminal(`Tx Hash: ${receipt.hash}`, 'accent');
            
            // Save name to local storage mapped by username so we can display it later
            localStorage.setItem('zkp_profile_' + username, name);

            showToast('Registrasi ZKP berhasil!', 'success');
            setTimeout(() => navigate('/zkp/login'), 2500);
        } catch (err) {
            logTerminal(`ERROR: ${err.message}`, 'error');
            showToast(err.message, 'error');
        }
    });
}

function bindZkpLoginEvents() {
    document.getElementById('btn-connect-wallet')?.addEventListener('click', async () => {
        try {
            await connectMetaMask();
            renderPage(); 
        } catch (err) { showToast(err.message, 'error'); }
    });

    document.getElementById('form-zkp-login')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFormErrors('form-zkp-login');
        clearTerminal();

        const username = document.getElementById('zkp-login-username').value.trim();
        const password = document.getElementById('zkp-login-password').value;

        if (!isConnected()) { showToast('Hubungkan MetaMask dahulu', 'error'); return; }
        if (!username) { showFieldError('zkp-login-username', 'Wajib diisi'); return; }
        if (!password) { showFieldError('zkp-login-password', 'Wajib diisi'); return; }

        try {
            logTerminal('Mulai proses Login ZKP...', 'info');
            
            const netInfo = await getNetworkInfo();
            if (netInfo) {
                logTerminal(`Jaringan terdeteksi: ${netInfo.name} (Chain ID: ${netInfo.chainId})`, 'accent');
                logTerminal(`Wallet Address: ${getCurrentAccount()}`, 'info');
            }

            logTerminal('Mengambil file circuit.wasm & auth_final.zkey...', 'info');
            logTerminal('Men-generate Zero-Knowledge Proof secara lokal (SnarkJS)...', 'info');
            
            const { proof, publicSignals, commitment } = await generateProof(password);
            logTerminal('Proof berhasil dibuat! Mengekstrak calldata...', 'success');
            logTerminal(`Commitment Hash: ${commitment.substring(0,20)}...`, 'accent');

            const formattedProof = formatProofForContract(proof, publicSignals);
            
            logTerminal('Mengirim transaksi verifikasi ZKP ke Smart Contract di Sepolia...', 'info');
            
            const receipt = await loginOnChain(username, formattedProof);
            
            logTerminal(`Verifikasi Sukses di Blockchain! Block: ${receipt.blockNumber}`, 'success');
            logTerminal(`Tx Hash: ${receipt.hash}`, 'accent');

            // Load name from local storage if available
            const name = localStorage.getItem('zkp_profile_' + username) || '';

            saveSession({ username, name, method: 'zkp', commitment, wallet: getCurrentAccount() });
            
            showToast('Login ZKP berhasil!', 'success');
            setTimeout(() => navigate('/zkp/dashboard'), 2000);
        } catch (err) {
            logTerminal(`ERROR: ${err.message}`, 'error');
            showToast(err.message, 'error');
        }
    });
}

// ============================================================
//  Initialize App
// ============================================================
async function init() {
    setupMetaMaskListeners(() => renderPage(), () => {});
    checkZKPArtifacts();
    renderPage();
    window.addEventListener('hashchange', renderPage);
}
document.addEventListener('DOMContentLoaded', init);
