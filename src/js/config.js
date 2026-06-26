/**
 * ============================================================
 *  Config - Contract ABI, Addresses & Constants
 * ============================================================
 * 
 *  PENTING: Setelah deploy smart contract di Remix,
 *  update VERIFIER_ADDRESS dan AUTH_ADDRESS di bawah!
 */

// ============================================================
//  Network Configuration - Sepolia Testnet
// ============================================================
export const NETWORK = {
    chainId: '0xaa36a7', // 11155111 in hex (Sepolia)
    chainName: 'Sepolia Testnet',
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    nativeCurrency: {
        name: 'SepoliaETH',
        symbol: 'ETH',
        decimals: 18,
    },
};

// ============================================================
//  Contract Addresses (UPDATE SETELAH DEPLOY!)
// ============================================================
// Deploy Verifier.sol terlebih dahulu, lalu ZKPAuth.sol
export const VERIFIER_ADDRESS = '0x3789C0dA7A4529Ed397a6f2b415E0B1B12f1e349'; // ← UPDATE INI
export const AUTH_ADDRESS = '0x1b5771B964444CEE4836E0c630e66E90AFc61618';     // ← UPDATE INI

// ============================================================
//  ZKP Artifacts Paths
// ============================================================
export const ZKP_WASM_PATH = '/zkp/auth.wasm';
export const ZKP_ZKEY_PATH = '/zkp/auth_final.zkey';

// ============================================================
//  BN128 Field Prime
// ============================================================
export const BN128_PRIME = BigInt(
    '21888242871839275222246405745257275088548364400416034343698204186575808495617'
);

// ============================================================
//  ZKPAuth Contract ABI (Minimal - hanya fungsi yang dipakai)
// ============================================================
export const AUTH_ABI = [
    // Register
    {
        inputs: [
            { internalType: 'string', name: '_username', type: 'string' },
            { internalType: 'uint256', name: '_commitment', type: 'uint256' },
        ],
        name: 'register',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    // Login
    {
        inputs: [
            { internalType: 'string', name: '_username', type: 'string' },
            { internalType: 'uint[2]', name: '_pA', type: 'uint256[2]' },
            { internalType: 'uint[2][2]', name: '_pB', type: 'uint256[2][2]' },
            { internalType: 'uint[2]', name: '_pC', type: 'uint256[2]' },
            { internalType: 'uint[1]', name: '_pubSignals', type: 'uint256[1]' },
        ],
        name: 'login',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    // Get User
    {
        inputs: [{ internalType: 'string', name: '_username', type: 'string' }],
        name: 'getUser',
        outputs: [
            { internalType: 'bool', name: 'isRegistered', type: 'bool' },
            { internalType: 'uint256', name: 'commitment', type: 'uint256' },
            { internalType: 'uint256', name: 'registeredAt', type: 'uint256' },
            { internalType: 'uint256', name: 'loginCount', type: 'uint256' },
            { internalType: 'uint256', name: 'lastLogin', type: 'uint256' },
            { internalType: 'address', name: 'registeredBy', type: 'address' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    // Is User Registered
    {
        inputs: [{ internalType: 'string', name: '_username', type: 'string' }],
        name: 'isUserRegistered',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    // Get Commitment
    {
        inputs: [{ internalType: 'string', name: '_username', type: 'string' }],
        name: 'getCommitment',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    // Total Users
    {
        inputs: [],
        name: 'totalUsers',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    // Events
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'string', name: 'username', type: 'string' },
            { indexed: false, internalType: 'uint256', name: 'commitment', type: 'uint256' },
            { indexed: true, internalType: 'address', name: 'wallet', type: 'address' },
            { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
        ],
        name: 'UserRegistered',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'string', name: 'username', type: 'string' },
            { indexed: true, internalType: 'address', name: 'wallet', type: 'address' },
            { indexed: false, internalType: 'uint256', name: 'loginCount', type: 'uint256' },
            { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
        ],
        name: 'UserLoggedIn',
        type: 'event',
    },
];
