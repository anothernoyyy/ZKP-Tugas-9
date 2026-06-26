/**
 * ============================================================
 *  Setup Circuit Script
 *  Compile Circom circuit + Trusted Setup + Generate Verifier
 * ============================================================
 *
 *  Script ini melakukan:
 *  1. Compile circuit auth.circom → auth.r1cs + auth.wasm
 *  2. Powers of Tau ceremony (trusted setup)
 *  3. Generate proving key (zkey)
 *  4. Generate verification key
 *  5. Export Solidity verifier (Verifier.sol)
 *  6. Copy artifacts ke public/zkp/
 *
 *  Prasyarat:
 *  - circom terinstall (build dari Rust)
 *  - snarkjs terinstall (npm install)
 *  - circomlib terinstall (npm install)
 *
 *  Jalankan: node scripts/setup-circuit.js
 * ============================================================
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CIRCUITS_DIR = path.join(ROOT, 'circuits');
const BUILD_DIR = path.join(ROOT, 'build');
const PUBLIC_ZKP = path.join(ROOT, 'public', 'zkp');
const CONTRACTS_DIR = path.join(ROOT, 'contracts');

// Buat direktori yang diperlukan
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
    }
}

function run(cmd, cwd = BUILD_DIR) {
    console.log(`\n🔧 Running: ${cmd}`);
    try {
        execSync(cmd, { cwd, stdio: 'inherit' });
    } catch (error) {
        console.error(`❌ Command failed: ${cmd}`);
        process.exit(1);
    }
}

async function main() {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║   ZKP Auth - Circuit Setup                  ║');
    console.log('║   Circom + SnarkJS Trusted Setup             ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');

    // ============================================================
    //  Step 0: Persiapan direktori
    // ============================================================
    console.log('📋 Step 0: Persiapan direktori...');
    ensureDir(BUILD_DIR);
    ensureDir(PUBLIC_ZKP);

    // ============================================================
    //  Step 1: Compile Circuit
    // ============================================================
    console.log('\n📋 Step 1: Compile circuit auth.circom...');
    const circuitPath = path.join(CIRCUITS_DIR, 'auth.circom');
    
    if (!fs.existsSync(circuitPath)) {
        console.error('❌ File circuits/auth.circom tidak ditemukan!');
        process.exit(1);
    }

    run(`circom "${circuitPath}" --r1cs --wasm --sym --output "${BUILD_DIR}"`, ROOT);
    console.log('✅ Circuit berhasil di-compile!');

    // ============================================================
    //  Step 2: Powers of Tau Ceremony (Trusted Setup Phase 1)
    // ============================================================
    console.log('\n📋 Step 2: Powers of Tau ceremony...');
    
    // Generate initial Powers of Tau
    // Power 12 cukup untuk circuit kecil (hingga 4096 constraints)
    run('npx snarkjs powersoftau new bn128 12 pot12_0000.ptau -v');
    console.log('  ↳ Initial ptau generated');

    // Contribute to ceremony (entropy)
    run('npx snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="ZKP Auth Contribution" -v -e="random entropy for trusted setup"');
    console.log('  ↳ Contribution added');

    // Prepare phase 2
    run('npx snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v');
    console.log('✅ Powers of Tau ceremony selesai!');

    // ============================================================
    //  Step 3: Generate Proving Key (zkey) - Phase 2
    // ============================================================
    console.log('\n📋 Step 3: Generate proving key (zkey)...');
    
    const r1csPath = path.join(BUILD_DIR, 'auth.r1cs');
    run(`npx snarkjs groth16 setup "${r1csPath}" pot12_final.ptau auth_0000.zkey`);
    console.log('  ↳ Initial zkey generated');

    // Contribute to phase 2
    run('npx snarkjs zkey contribute auth_0000.zkey auth_final.zkey --name="ZKP Auth Phase 2" -v -e="more random entropy"');
    console.log('✅ Proving key berhasil di-generate!');

    // ============================================================
    //  Step 4: Export Verification Key
    // ============================================================
    console.log('\n📋 Step 4: Export verification key...');
    run('npx snarkjs zkey export verificationkey auth_final.zkey verification_key.json');
    console.log('✅ Verification key exported!');

    // ============================================================
    //  Step 5: Generate Solidity Verifier
    // ============================================================
    console.log('\n📋 Step 5: Generate Solidity verifier...');
    const verifierOutput = path.join(CONTRACTS_DIR, 'Verifier.sol');
    run(`npx snarkjs zkey export solidityverifier auth_final.zkey "${verifierOutput}"`);
    console.log('✅ Verifier.sol berhasil di-generate!');

    // ============================================================
    //  Step 6: Copy artifacts ke public/zkp/
    // ============================================================
    console.log('\n📋 Step 6: Copy artifacts ke public/zkp/...');
    
    // Copy WASM
    const wasmSource = path.join(BUILD_DIR, 'auth_js', 'auth.wasm');
    const wasmDest = path.join(PUBLIC_ZKP, 'auth.wasm');
    if (fs.existsSync(wasmSource)) {
        fs.copyFileSync(wasmSource, wasmDest);
        console.log('  ↳ auth.wasm copied');
    } else {
        console.warn('  ⚠️ auth.wasm tidak ditemukan di build/auth_js/');
    }

    // Copy zkey
    const zkeySource = path.join(BUILD_DIR, 'auth_final.zkey');
    const zkeyDest = path.join(PUBLIC_ZKP, 'auth_final.zkey');
    if (fs.existsSync(zkeySource)) {
        fs.copyFileSync(zkeySource, zkeyDest);
        console.log('  ↳ auth_final.zkey copied');
    }

    // Copy verification key
    const vkSource = path.join(BUILD_DIR, 'verification_key.json');
    const vkDest = path.join(PUBLIC_ZKP, 'verification_key.json');
    if (fs.existsSync(vkSource)) {
        fs.copyFileSync(vkSource, vkDest);
        console.log('  ↳ verification_key.json copied');
    }

    console.log('✅ Artifacts berhasil di-copy!');

    // ============================================================
    //  Summary
    // ============================================================
    console.log('\n');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║   ✅ Setup Selesai!                          ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log('║                                              ║');
    console.log('║   Files yang di-generate:                    ║');
    console.log('║   📄 contracts/Verifier.sol                  ║');
    console.log('║   📄 public/zkp/auth.wasm                   ║');
    console.log('║   📄 public/zkp/auth_final.zkey             ║');
    console.log('║   📄 public/zkp/verification_key.json       ║');
    console.log('║                                              ║');
    console.log('║   Langkah selanjutnya:                       ║');
    console.log('║   1. Deploy Verifier.sol ke Remix IDE        ║');
    console.log('║   2. Deploy ZKPAuth.sol dengan alamat         ║');
    console.log('║      Verifier sebagai constructor param      ║');
    console.log('║   3. Update config.js dengan alamat contract ║');
    console.log('║   4. npm run dev                             ║');
    console.log('║                                              ║');
    console.log('╚══════════════════════════════════════════════╝');
}

main().catch(console.error);
