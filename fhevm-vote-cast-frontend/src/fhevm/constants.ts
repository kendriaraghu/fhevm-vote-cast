export const FHEVM_CONSTANTS = {
  // Network configurations
  NETWORKS: {
    LOCALHOST: {
      chainId: 31337,
      name: 'localhost',
      rpcUrl: 'http://localhost:8545',
    },
    SEPOLIA: {
      chainId: 11155111,
      name: 'sepolia',
      rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    },
  },
  
  // Contract addresses (will be populated by genabi script)
  CONTRACTS: {
    FHEVoteCast: {
      localhost: '0x0000000000000000000000000000000000000000',
      sepolia: '0x0000000000000000000000000000000000000000',
    },
  },
  
  // FHEVM configuration
  FHEVM: {
    GATEWAY_CHAIN_ID: 55815,
    ACL_CONTRACT_ADDRESS: '0x50157CFfD6bBFA2DECe204a89ec419c23ef5755D',
    INPUT_VERIFIER_ADDRESS: '0x901F8942346f7AB3a01F6D7613119Bca447Bb030',
    KMS_VERIFIER_ADDRESS: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
  },
  
  // Survey types
  SURVEY_TYPES: {
    STAR_5: 0,
    SCORE_10: 1,
    GRADE_ABC: 2,
  },
  
  // Survey status
  SURVEY_STATUS: {
    DRAFT: 0,
    ACTIVE: 1,
    ENDED: 2,
  },
  
  // Storage keys
  STORAGE_KEYS: {
    WALLET_CONNECTOR: 'wallet.lastConnectorId',
    WALLET_ACCOUNTS: 'wallet.lastAccounts',
    WALLET_CHAIN_ID: 'wallet.lastChainId',
    WALLET_CONNECTED: 'wallet.connected',
    FHEVM_DECRYPTION_SIGNATURE: 'fhevm.decryptionSignature',
  },
  
  // UI constants
  UI: {
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 500,
    POLLING_INTERVAL: 5000,
  },
};

