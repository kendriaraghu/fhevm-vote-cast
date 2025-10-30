import { JsonRpcProvider } from 'ethers';

const HARDHAT_NODE_URL = 'http://localhost:8545';

async function checkHardhatNode() {
  console.log('🔍 Checking if Hardhat node is running...');
  
  try {
    const provider = new JsonRpcProvider(HARDHAT_NODE_URL);
    
    // Check if the node is running
    const network = await provider.getNetwork();
    console.log(`✅ Hardhat node is running on chain ID: ${network.chainId}`);
    
    // Check if it's a local network
    if (network.chainId !== 31337n) {
      console.log('⚠️  Warning: Not running on localhost (chain ID 31337)');
    }
    
    // Check if FHEVM metadata is available
    try {
      const metadata = await provider.send('fhevm_relayer_metadata', []);
      if (metadata && metadata.ACLAddress && metadata.InputVerifierAddress && metadata.KMSVerifierAddress) {
        console.log('✅ FHEVM metadata is available');
        console.log(`   ACL Address: ${metadata.ACLAddress}`);
        console.log(`   Input Verifier: ${metadata.InputVerifierAddress}`);
        console.log(`   KMS Verifier: ${metadata.KMSVerifierAddress}`);
      } else {
        console.log('⚠️  FHEVM metadata not available - using mock mode');
      }
    } catch (error) {
      console.log('⚠️  FHEVM metadata not available - using mock mode');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Hardhat node is not running or not accessible');
    console.error('   Please start the node with: npx hardhat node');
    console.error('   Error:', error.message);
    process.exit(1);
  }
}

// Run the check
checkHardhatNode();

