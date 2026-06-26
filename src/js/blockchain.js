/**
 * ============================================================
 *  Blockchain Module - MetaMask & Smart Contract Interaction
 * ============================================================
 * 
 *  Module ini menangani:
 *  1. MetaMask connection (connect wallet)
 *  2. Network switching (Sepolia)
 *  3. Smart contract calls (register, login, getUser)
 *  4. Transaction handling
 */

import { NETWORK, AUTH_ADDRESS, AUTH_ABI } from './config.js';
import { showToast } from './ui.js';

// ============================================================
//  State
// ============================================================
let provider = null;
let signer = null;
let contract = null;
let currentAccount = null;

// ============================================================
//  MetaMask Connection
// ============================================================

/**
 * Cek apakah MetaMask terinstall
 */
export function isMetaMaskInstalled() {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
}

/**
 * Connect ke MetaMask
 * @returns {Promise<string>} Wallet address
 */
export async function connectMetaMask() {
    if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask belum terinstall! Silakan install di metamask.io');
    }

    const ethersLib = window.ethers;
    if (!ethersLib) {
        throw new Error('ethers.js belum dimuat!');
    }

    try {
        // Request account access
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
        });

        if (!accounts || accounts.length === 0) {
            throw new Error('Tidak ada akun yang dipilih');
        }

        // Setup provider & signer
        provider = new ethersLib.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        currentAccount = accounts[0];

        // Ensure correct network
        await switchToSepolia();

        // Setup contract
        setupContract();

        console.log('🦊 MetaMask connected:', currentAccount);
        return currentAccount;
    } catch (error) {
        if (error.code === 4001) {
            throw new Error('Koneksi MetaMask ditolak oleh user');
        }
        throw error;
    }
}

/**
 * Get current connected account
 */
export function getCurrentAccount() {
    return currentAccount;
}

/**
 * Check if wallet is connected
 */
export function isConnected() {
    return currentAccount !== null;
}

// ============================================================
//  Network Management
// ============================================================

/**
 * Switch ke Sepolia testnet
 */
async function switchToSepolia() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: NETWORK.chainId }],
        });
    } catch (switchError) {
        // Chain belum ditambahkan, tambahkan
        if (switchError.code === 4902) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainId: NETWORK.chainId,
                        chainName: NETWORK.chainName,
                        rpcUrls: NETWORK.rpcUrls,
                        blockExplorerUrls: NETWORK.blockExplorerUrls,
                        nativeCurrency: NETWORK.nativeCurrency,
                    },
                ],
            });
        } else {
            throw switchError;
        }
    }
}

/**
 * Get current network info
 */
export async function getNetworkInfo() {
    if (!provider) return null;
    try {
        const network = await provider.getNetwork();
        return {
            chainId: network.chainId.toString(),
            name: network.name,
        };
    } catch {
        return null;
    }
}

// ============================================================
//  Contract Setup
// ============================================================

/**
 * Setup contract instance
 */
function setupContract() {
    const ethersLib = window.ethers;
    if (!ethersLib || !signer) return;

    if (AUTH_ADDRESS === '0x0000000000000000000000000000000000000000') {
        console.warn('⚠️ Contract address belum di-set! Update config.js');
        return;
    }

    contract = new ethersLib.Contract(AUTH_ADDRESS, AUTH_ABI, signer);
    console.log('📄 Contract connected at:', AUTH_ADDRESS);
}

// ============================================================
//  Smart Contract Interactions
// ============================================================

/**
 * Register user di blockchain
 * 
 * @param {string} username - Username
 * @param {string} commitment - Poseidon hash (sebagai string desimal)
 * @returns {Promise<Object>} Transaction receipt
 */
export async function registerOnChain(username, commitment) {
    if (!contract) {
        throw new Error('Contract belum terhubung! Pastikan MetaMask connected dan contract address sudah di-set.');
    }

    console.log('📝 Registering on-chain...');
    console.log('  Username:', username);
    console.log('  Commitment:', commitment);

    try {
        const tx = await contract.register(username, commitment);
        console.log('⏳ Transaction sent:', tx.hash);
        showToast(`Transaction sent! Hash: ${tx.hash.substring(0, 10)}...`, 'info');

        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed!', receipt);

        return {
            hash: tx.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
        };
    } catch (error) {
        console.error('❌ Register failed:', error);
        if (error.reason) {
            throw new Error(`Register gagal: ${error.reason}`);
        }
        if (error.code === 'ACTION_REJECTED') {
            throw new Error('Transaksi ditolak oleh user');
        }
        throw error;
    }
}

/**
 * Login menggunakan ZKP di blockchain
 * 
 * @param {string} username - Username
 * @param {Object} formattedProof - Proof yang sudah diformat { pA, pB, pC, pubSignals }
 * @returns {Promise<Object>} Transaction receipt
 */
export async function loginOnChain(username, formattedProof) {
    if (!contract) {
        throw new Error('Contract belum terhubung! Pastikan MetaMask connected dan contract address sudah di-set.');
    }

    console.log('🔐 Login on-chain with ZKP...');

    try {
        const tx = await contract.login(
            username,
            formattedProof.pA,
            formattedProof.pB,
            formattedProof.pC,
            formattedProof.pubSignals
        );
        console.log('⏳ Login transaction sent:', tx.hash);
        showToast(`Verifying proof on-chain... Hash: ${tx.hash.substring(0, 10)}...`, 'info');

        const receipt = await tx.wait();
        console.log('✅ Login verified on-chain!', receipt);

        return {
            hash: tx.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
        };
    } catch (error) {
        console.error('❌ Login failed:', error);
        if (error.reason) {
            throw new Error(`Login gagal: ${error.reason}`);
        }
        if (error.code === 'ACTION_REJECTED') {
            throw new Error('Transaksi ditolak oleh user');
        }
        throw error;
    }
}

/**
 * Get user data from blockchain
 * 
 * @param {string} username - Username
 * @returns {Promise<Object|null>} User data or null
 */
export async function getUserFromChain(username) {
    if (!contract) {
        // Coba buat read-only provider
        const ethersLib = window.ethers;
        if (!ethersLib) return null;

        try {
            const readProvider = new ethersLib.JsonRpcProvider(NETWORK.rpcUrls[0]);
            const readContract = new ethersLib.Contract(AUTH_ADDRESS, AUTH_ABI, readProvider);
            
            const result = await readContract.getUser(username);
            return {
                isRegistered: result[0],
                commitment: result[1].toString(),
                registeredAt: result[2].toString(),
                loginCount: result[3].toString(),
                lastLogin: result[4].toString(),
                registeredBy: result[5],
            };
        } catch {
            return null;
        }
    }

    try {
        const result = await contract.getUser(username);
        return {
            isRegistered: result[0],
            commitment: result[1].toString(),
            registeredAt: result[2].toString(),
            loginCount: result[3].toString(),
            lastLogin: result[4].toString(),
            registeredBy: result[5],
        };
    } catch {
        return null;
    }
}

/**
 * Check if user is registered on chain
 */
export async function isUserRegisteredOnChain(username) {
    const user = await getUserFromChain(username);
    return user ? user.isRegistered : false;
}

// ============================================================
//  Event Listeners for MetaMask
// ============================================================

/**
 * Setup MetaMask event listeners
 */
export function setupMetaMaskListeners(onAccountChange, onChainChange) {
    if (!window.ethereum) return;

    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            currentAccount = null;
            provider = null;
            signer = null;
            contract = null;
            showToast('Wallet disconnected', 'warning');
        } else {
            currentAccount = accounts[0];
            showToast(`Account changed: ${currentAccount.substring(0, 8)}...`, 'info');
        }
        if (onAccountChange) onAccountChange(currentAccount);
    });

    window.ethereum.on('chainChanged', () => {
        showToast('Network changed. Reloading...', 'warning');
        if (onChainChange) onChainChange();
        setTimeout(() => window.location.reload(), 1500);
    });
}
