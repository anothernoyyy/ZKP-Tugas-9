/**
 * ============================================================
 *  ZKP Module - Zero-Knowledge Proof Generation
 * ============================================================
 * 
 *  Module ini menangani:
 *  1. Konversi password → field element (BN128)
 *  2. Generate ZK proof menggunakan snarkjs (Groth16)
 *  3. Format proof untuk smart contract
 * 
 *  Alur ZKP:
 *  - Password user di-convert ke field element
 *  - snarkjs.groth16.fullProve() menghasilkan proof + public signals
 *  - Public signal[0] = Poseidon(password) = commitment
 *  - Proof di-format untuk Solidity verifier
 */

import { BN128_PRIME, ZKP_WASM_PATH, ZKP_ZKEY_PATH } from './config.js';

// ============================================================
//  Password → Field Element Conversion
// ============================================================

/**
 * Konversi password string ke field element BN128
 * Menggunakan keccak256 hash dari ethers.js
 * 
 * @param {string} password - Password user
 * @returns {string} Field element sebagai string desimal
 */
export function passwordToFieldElement(password) {
    // Gunakan ethers.js keccak256 untuk hash password
    const ethersLib = window.ethers;
    if (!ethersLib) {
        throw new Error('ethers.js belum dimuat!');
    }

    // Hash password dengan keccak256
    const hash = ethersLib.keccak256(ethersLib.toUtf8Bytes(password));
    
    // Convert ke BigInt dan mod dengan BN128 prime
    // Ini memastikan hasilnya valid sebagai field element
    const bn = BigInt(hash);
    const fieldElement = bn % BN128_PRIME;
    
    return fieldElement.toString();
}

// ============================================================
//  ZKP Proof Generation
// ============================================================

/**
 * Generate ZK Proof (Groth16) menggunakan snarkjs
 * 
 * Proses:
 * 1. Konversi password ke field element
 * 2. Jalankan snarkjs.groth16.fullProve() 
 * 3. Return proof + public signals (commitment)
 * 
 * @param {string} password - Password user
 * @returns {Promise<{proof: Object, publicSignals: string[], commitment: string}>}
 */
export async function generateProof(password) {
    const snarkjs = window.snarkjs;
    if (!snarkjs) {
        throw new Error('snarkjs belum dimuat! Pastikan CDN script loaded.');
    }

    // Step 1: Convert password ke field element
    const secret = passwordToFieldElement(password);
    console.log('🔐 Secret (field element):', secret.substring(0, 20) + '...');

    // Step 2: Generate proof menggunakan Groth16
    // Input circuit: { secret: <field_element> }
    // Output: proof + publicSignals[0] = Poseidon(secret) = commitment
    console.log('⏳ Generating ZK proof...');
    
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        { secret: secret },
        ZKP_WASM_PATH,
        ZKP_ZKEY_PATH
    );

    console.log('✅ Proof generated!');
    console.log('📊 Commitment (public signal):', publicSignals[0]);

    return {
        proof,
        publicSignals,
        commitment: publicSignals[0],
    };
}

// ============================================================
//  Format Proof untuk Solidity
// ============================================================

/**
 * Format proof snarkjs ke format yang diterima smart contract
 * Solidity verifier menerima: (uint[2] a, uint[2][2] b, uint[2] c, uint[1] pubSignals)
 * 
 * @param {Object} proof - Proof dari snarkjs
 * @param {string[]} publicSignals - Public signals dari snarkjs
 * @returns {{ pA: string[], pB: string[][], pC: string[], pubSignals: string[] }}
 */
export function formatProofForContract(proof, publicSignals) {
    // snarkjs proof format:
    // proof.pi_a = [x, y, z] (G1 point)
    // proof.pi_b = [[x1, x2], [y1, y2], [z1, z2]] (G2 point)  
    // proof.pi_c = [x, y, z] (G1 point)

    return {
        pA: [proof.pi_a[0], proof.pi_a[1]],
        pB: [
            [proof.pi_b[0][1], proof.pi_b[0][0]], // Note: order is reversed for Solidity
            [proof.pi_b[1][1], proof.pi_b[1][0]],
        ],
        pC: [proof.pi_c[0], proof.pi_c[1]],
        pubSignals: [publicSignals[0]],
    };
}

// ============================================================
//  Generate Solidity Calldata
// ============================================================

/**
 * Generate calldata string untuk testing di Remix IDE
 * 
 * @param {Object} proof - Proof dari snarkjs
 * @param {string[]} publicSignals - Public signals
 * @returns {Promise<string>} Formatted calldata string
 */
export async function generateCalldata(proof, publicSignals) {
    const snarkjs = window.snarkjs;
    if (!snarkjs) {
        throw new Error('snarkjs belum dimuat!');
    }

    const calldata = await snarkjs.groth16.exportSolidityCallData(
        proof,
        publicSignals
    );
    
    return calldata;
}

// ============================================================
//  Verify Proof Locally (opsional - untuk testing)
// ============================================================

/**
 * Verifikasi proof secara lokal menggunakan verification key
 * 
 * @param {Object} proof - Proof dari snarkjs
 * @param {string[]} publicSignals - Public signals
 * @returns {Promise<boolean>} true jika valid
 */
export async function verifyProofLocally(proof, publicSignals) {
    const snarkjs = window.snarkjs;
    if (!snarkjs) {
        throw new Error('snarkjs belum dimuat!');
    }

    try {
        const vkeyResponse = await fetch('/zkp/verification_key.json');
        const vkey = await vkeyResponse.json();
        
        const isValid = await snarkjs.groth16.verify(vkey, publicSignals, proof);
        console.log('🔍 Local verification:', isValid ? '✅ Valid' : '❌ Invalid');
        
        return isValid;
    } catch (error) {
        console.warn('⚠️ Local verification gagal:', error.message);
        return false;
    }
}

// ============================================================
//  Check ZKP Artifacts Availability
// ============================================================

/**
 * Cek apakah file ZKP artifacts (WASM + zkey) tersedia
 * 
 * @returns {Promise<boolean>}
 */
export async function checkZKPArtifacts() {
    try {
        const [wasmRes, zkeyRes] = await Promise.all([
            fetch(ZKP_WASM_PATH, { method: 'HEAD' }),
            fetch(ZKP_ZKEY_PATH, { method: 'HEAD' }),
        ]);
        return wasmRes.ok && zkeyRes.ok;
    } catch {
        return false;
    }
}
