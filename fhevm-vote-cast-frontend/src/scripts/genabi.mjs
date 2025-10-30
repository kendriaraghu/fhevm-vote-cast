import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the deployments directory
const deploymentsDir = path.join(__dirname, '../../../fhevm-hardhat-template/deployments');
const outputDir = path.join(__dirname, '../abi');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Networks to process
const networks = ['localhost', 'sepolia'];

// Contract names to process
const contractNames = ['FHEVoteCast'];

function generateABIFiles() {
  console.log('🔧 Generating ABI files...');
  
  const allAddresses = {};
  
  for (const network of networks) {
    const networkDir = path.join(deploymentsDir, network);
    
    if (!fs.existsSync(networkDir)) {
      console.log(`⚠️  Network directory not found: ${network}`);
      continue;
    }
    
    allAddresses[network] = {};
    
    for (const contractName of contractNames) {
      const contractFile = path.join(networkDir, `${contractName}.json`);
      
      if (fs.existsSync(contractFile)) {
        try {
          const contractData = JSON.parse(fs.readFileSync(contractFile, 'utf8'));
          
          // Generate ABI file
          const abiContent = `export const ${contractName}ABI = {
  abi: ${JSON.stringify(contractData.abi, null, 2)},
  bytecode: "${contractData.bytecode}",
  deployedBytecode: "${contractData.deployedBytecode}",
  linkReferences: ${JSON.stringify(contractData.linkReferences, null, 2)},
  deployedLinkReferences: ${JSON.stringify(contractData.deployedLinkReferences, null, 2)},
};
`;
          
          const abiFile = path.join(outputDir, `${contractName}ABI.ts`);
          fs.writeFileSync(abiFile, abiContent);
          console.log(`✅ Generated ${contractName}ABI.ts`);
          
          // Store address for addresses file
          allAddresses[network][contractName] = {
            address: contractData.address,
            chainId: contractData.chainId,
            chainName: getChainName(contractData.chainId),
          };
          
        } catch (error) {
          console.error(`❌ Error processing ${contractName} for ${network}:`, error.message);
        }
      } else {
        console.log(`⚠️  Contract file not found: ${contractFile}`);
      }
    }
  }
  
  // Generate addresses file
  const addressesContent = `export const ${contractNames[0]}Addresses = ${JSON.stringify(allAddresses, null, 2)};
`;
  
  const addressesFile = path.join(outputDir, `${contractNames[0]}Addresses.ts`);
  fs.writeFileSync(addressesFile, addressesContent);
  console.log(`✅ Generated ${contractNames[0]}Addresses.ts`);
  
  console.log('🎉 ABI generation completed!');
}

function getChainName(chainId) {
  const chainNames = {
    1: 'mainnet',
    5: 'goerli',
    11155111: 'sepolia',
    31337: 'localhost',
  };
  return chainNames[chainId] || `chain-${chainId}`;
}

// Run the generation
generateABIFiles();

