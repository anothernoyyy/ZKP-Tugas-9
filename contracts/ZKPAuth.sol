// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ZKPAuth - Sistem Autentikasi berbasis Zero-Knowledge Proof
 * @notice Smart contract untuk Register & Login menggunakan ZKP (zk-SNARKs)
 * @dev Menggunakan Groth16 Verifier yang di-generate oleh snarkjs
 * 
 * Alur Kerja:
 * 1. REGISTER: User mengirim commitment (Poseidon hash dari password)
 *    → Commitment disimpan on-chain, password TIDAK PERNAH dikirim
 * 
 * 2. LOGIN: User generate ZK proof di browser, lalu submit ke contract
 *    → Contract verifikasi proof menggunakan Groth16 Verifier
 *    → Jika valid, user terautentikasi tanpa mengekspos password
 */

// Interface untuk Groth16 Verifier yang di-generate snarkjs
interface IGroth16Verifier {
    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[1] calldata _pubSignals
    ) external view returns (bool);
}

contract ZKPAuth {
    // ============================================================
    //  State Variables
    // ============================================================
    
    IGroth16Verifier public verifier;
    address public owner;
    uint256 public totalUsers;

    // Struktur data user (dioptimasi untuk menghemat GAS)
    struct User {
        uint256 commitment;      // Slot 1: Poseidon(password)
        uint64 registeredAt;     // Slot 2: Timestamp registrasi (8 bytes)
        uint64 lastLogin;        // Slot 2: Timestamp login (8 bytes)
        uint32 loginCount;       // Slot 2: Jumlah login (4 bytes)
        bool isRegistered;       // Slot 2: Status registrasi (1 byte)
        address registeredBy;    // Slot 3: Alamat wallet pendaftar (20 bytes)
    }

    // Mapping: keccak256(username) => User
    mapping(bytes32 => User) private users;

    // ============================================================
    //  Events
    // ============================================================
    
    event UserRegistered(
        string indexed username,
        uint256 commitment,
        address indexed wallet,
        uint256 timestamp
    );

    event UserLoggedIn(
        string indexed username,
        address indexed wallet,
        uint256 loginCount,
        uint256 timestamp
    );

    event VerifierUpdated(
        address indexed oldVerifier,
        address indexed newVerifier
    );

    // ============================================================
    //  Modifiers
    // ============================================================
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    // ============================================================
    //  Constructor
    // ============================================================
    
    /**
     * @notice Deploy contract dengan alamat Groth16 Verifier yang sudah di-hardcode
     */
    constructor() {
        verifier = IGroth16Verifier(0x3789C0dA7A4529Ed397a6f2b415E0B1B12f1e349);
        owner = msg.sender;
    }

    // ============================================================
    //  Register Function
    // ============================================================
    
    /**
     * @notice Registrasi user baru dengan menyimpan commitment (hash password)
     * @param _username Username yang dipilih user
     * @param _commitment Poseidon hash dari password (dihitung di client-side)
     * 
     * @dev Password TIDAK PERNAH dikirim ke blockchain.
     *      Yang disimpan hanya commitment = Poseidon(password)
     *      Ini adalah inti dari Zero-Knowledge Proof.
     */
    function register(string calldata _username, uint256 _commitment) external {
        bytes32 key = keccak256(abi.encodePacked(_username));
        
        require(!users[key].isRegistered, "Username sudah terdaftar");
        require(_commitment != 0, "Commitment tidak valid");
        require(bytes(_username).length > 0, "Username tidak boleh kosong");
        require(bytes(_username).length <= 32, "Username terlalu panjang");

        users[key] = User({
            commitment: _commitment,
            registeredAt: uint64(block.timestamp),
            lastLogin: 0,
            loginCount: 0,
            isRegistered: true,
            registeredBy: msg.sender
        });

        totalUsers++;

        emit UserRegistered(_username, _commitment, msg.sender, block.timestamp);
    }

    // ============================================================
    //  Login Function (ZKP Verification)
    // ============================================================
    
    /**
     * @notice Login menggunakan Zero-Knowledge Proof
     * @param _username Username yang terdaftar
     * @param _pA Proof element A (dari snarkjs)
     * @param _pB Proof element B (dari snarkjs)
     * @param _pC Proof element C (dari snarkjs)
     * @param _pubSignals Public signals [commitment] (dari snarkjs)
     * 
     * @dev Verifikasi dilakukan dalam 2 langkah:
     *      1. Cek commitment dari proof === commitment tersimpan
     *      2. Verifikasi ZK proof menggunakan Groth16 Verifier
     *      
     *      Jika keduanya valid, user terautentikasi.
     *      Password TIDAK PERNAH diproses di smart contract.
     */
    function login(
        string calldata _username,
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[1] calldata _pubSignals
    ) external returns (bool) {
        bytes32 key = keccak256(abi.encodePacked(_username));
        User storage user = users[key];

        // Cek user terdaftar
        require(user.isRegistered, "User belum terdaftar");

        // Cek commitment dari proof cocok dengan yang tersimpan
        require(
            _pubSignals[0] == user.commitment,
            "Commitment tidak cocok - password salah"
        );

        // Verifikasi ZK Proof menggunakan Groth16
        bool isValid = verifier.verifyProof(_pA, _pB, _pC, _pubSignals);
        require(isValid, "ZK Proof tidak valid");

        // Update login stats
        user.loginCount++;
        user.lastLogin = uint64(block.timestamp);

        emit UserLoggedIn(
            _username,
            msg.sender,
            user.loginCount,
            block.timestamp
        );

        return true;
    }

    // ============================================================
    //  View Functions
    // ============================================================
    
    /**
     * @notice Ambil data user (tanpa password!)
     */
    function getUser(string calldata _username) external view returns (
        bool isRegistered,
        uint256 commitment,
        uint256 registeredAt,
        uint256 loginCount,
        uint256 lastLogin,
        address registeredBy
    ) {
        bytes32 key = keccak256(abi.encodePacked(_username));
        User storage user = users[key];
        return (
            user.isRegistered,
            user.commitment,
            user.registeredAt,
            user.loginCount,
            user.lastLogin,
            user.registeredBy
        );
    }

    /**
     * @notice Cek apakah username sudah terdaftar
     */
    function isUserRegistered(string calldata _username) external view returns (bool) {
        bytes32 key = keccak256(abi.encodePacked(_username));
        return users[key].isRegistered;
    }

    /**
     * @notice Ambil commitment user (untuk verifikasi di client)
     */
    function getCommitment(string calldata _username) external view returns (uint256) {
        bytes32 key = keccak256(abi.encodePacked(_username));
        require(users[key].isRegistered, "User belum terdaftar");
        return users[key].commitment;
    }

    // ============================================================
    //  Admin Functions
    // ============================================================
    
    /**
     * @notice Update alamat Verifier contract
     */
    function updateVerifier(address _newVerifier) external onlyOwner {
        require(_newVerifier != address(0), "Invalid verifier address");
        address oldVerifier = address(verifier);
        verifier = IGroth16Verifier(_newVerifier);
        emit VerifierUpdated(oldVerifier, _newVerifier);
    }
}
