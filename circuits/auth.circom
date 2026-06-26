/*
 * ============================================================
 *  ZKP Authentication Circuit
 *  Menggunakan Poseidon Hash untuk Zero-Knowledge Proof
 * ============================================================
 *
 *  Deskripsi:
 *  Circuit ini membuktikan bahwa prover mengetahui sebuah 
 *  "secret" (password) yang hash Poseidon-nya sama dengan
 *  commitment yang tersimpan di blockchain.
 *
 *  - Private Input : secret (password user, tidak pernah terekspos)
 *  - Public Output : commitment (Poseidon hash, disimpan on-chain)
 *
 *  Alur:
 *  1. Register: fullProve({secret}) → commitment → simpan di smart contract
 *  2. Login  : fullProve({secret}) → proof + commitment → verifikasi on-chain
 *
 * ============================================================
 */

pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/poseidon.circom";

template AuthVerify() {
    // ============================
    // Private Input (tidak diketahui verifier)
    // ============================
    signal input secret;     // Password user yang dikonversi ke field element

    // ============================
    // Public Output (diketahui verifier / smart contract)
    // ============================
    signal output commitment; // Hasil hash Poseidon dari secret

    // ============================
    // Komputasi Hash Poseidon
    // ============================
    // Poseidon adalah hash function yang "ZK-friendly"
    // Artinya sangat efisien ketika dijalankan di dalam circuit ZKP
    // dibandingkan SHA-256 atau Keccak yang membutuhkan ribuan constraints
    component hasher = Poseidon(1);
    hasher.inputs[0] <== secret;

    // ============================
    // Constraint Output
    // ============================
    // commitment = Poseidon(secret)
    // Smart contract akan membandingkan commitment ini
    // dengan yang tersimpan saat registrasi
    commitment <== hasher.out;
}

// ============================================================
// Main Component
// ============================================================
// secret bersifat private (default, karena tidak di-list di public)
// commitment bersifat public (output signal)
component main = AuthVerify();
