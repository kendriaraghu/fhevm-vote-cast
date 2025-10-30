# FHEVM Vote Cast

FHEVM Vote Cast is a privacy-preserving survey platform built on FHEVM (Fully Homomorphic Encryption Virtual Machine) technology. This decentralized application enables encrypted survey participation while maintaining complete user privacy. Unlike conventional surveys that expose individual responses, FHEVM Vote Cast uses fully homomorphic encryption to keep voting data confidential throughout the entire process.

## 🌟 Key Features

- **Privacy-Preserving Voting**: Individual responses are encrypted using FHEVM technology
- **Anonymous Participation**: User votes remain confidential and cannot be traced back to individuals
- **Aggregate Statistics**: Survey creators can only access aggregate statistics (total responses and average scores)
- **Multiple Rating Types**: Supports star ratings (1-5), numerical scores (1-10), and grade-based evaluations (A-F)
- **Web3 Integration**: Seamless integration with MetaMask and Web3 wallets
- **Dual Mode Support**: Works with both local mock FHEVM instances and real Sepolia testnet deployments

## 🏗️ Project Structure

```
zama_temp_survey/
├── fhevm-hardhat-template/     # Smart contracts and deployment
│   ├── contracts/              # Solidity smart contracts
│   │   └── FHEVoteCast.sol    # Main survey contract
│   ├── deploy/                 # Deployment scripts
│   ├── test/                   # Contract tests
│   └── hardhat.config.ts       # Hardhat configuration
│
├── fhevm-vote-cast-frontend/   # Next.js frontend application
│   ├── src/
│   │   ├── app/                # Next.js app router pages
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── fhevm/              # FHEVM integration logic
│   │   └── abi/                # Generated contract ABIs
│   └── package.json
│
└── frontend/                   # Reference implementation (read-only)

```

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm** or **yarn**: Package manager
- **MetaMask**: Web3 wallet browser extension
- **Hardhat Node** (for local development): For testing with mock FHEVM

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/kendriaraghu/fhevm-vote-cast.git
   cd fhevm-vote-cast
   ```

2. **Install dependencies**
   ```bash
   # Install contract dependencies
   cd fhevm-hardhat-template
   npm install

   # Install frontend dependencies
   cd ../fhevm-vote-cast-frontend
   npm install
   ```

3. **Start local Hardhat node** (Terminal 1)
   ```bash
   cd fhevm-hardhat-template
   npx hardhat node
   ```

4. **Deploy contracts** (Terminal 2)
   ```bash
   cd fhevm-hardhat-template
   npx hardhat deploy --network localhost
   ```

5. **Start frontend** (Terminal 3)
   ```bash
   cd fhevm-vote-cast-frontend
   npm run dev:mock
   ```

6. **Access the application**
   - Open http://localhost:3000 in your browser
   - Connect MetaMask to localhost:8545
   - Create surveys and participate!

### Sepolia Testnet Deployment

1. **Configure environment variables**
   ```bash
   cd fhevm-hardhat-template
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   ```

2. **Deploy to Sepolia**
   ```bash
   npx hardhat deploy --network sepolia
   ```

3. **Deployed Contract Address**
   - Sepolia: `0x283984251b2Eddd9c97166a0303a89114dE1Bcb8`
   - View on [Etherscan](https://sepolia.etherscan.io/address/0x283984251b2Eddd9c97166a0303a89114dE1Bcb8)

4. **Start frontend for testnet**
   ```bash
   cd fhevm-vote-cast-frontend
   npm run dev
   ```

## 🔐 FHEVM Technology

This project leverages FHEVM (Fully Homomorphic Encryption Virtual Machine) to enable:

- **Encrypted Data Storage**: All votes are stored as encrypted values (`euint32`) on-chain
- **Homomorphic Operations**: Statistical operations (sum, count) are performed on encrypted data
- **Privacy Guarantees**: Individual responses cannot be decrypted without proper authorization
- **Selective Decryption**: Only aggregate statistics (totals and averages) can be decrypted by survey creators

### How It Works

1. **Survey Creation**: Creator sets up a survey with title, description, type, and time range
2. **Encrypted Voting**: Participants encrypt their votes using FHEVM SDK before submission
3. **On-Chain Storage**: Encrypted votes are stored and aggregated on-chain
4. **Statistical Analysis**: Survey creator can decrypt only aggregate statistics (total responses, average score)
5. **Privacy Protection**: Individual votes remain encrypted and anonymous

## 📚 Documentation

- **FHEVM Reference**: See `Fhevm0.8_Reference.md` for FHEVM API documentation
- **Requirements**: See `REQUIREMENTS.md` for detailed project requirements
- **Contract API**: Check `fhevm-hardhat-template/contracts/FHEVoteCast.sol` for contract documentation

## 🧪 Testing

### Contract Tests
```bash
cd fhevm-hardhat-template
npx hardhat test
```

### Frontend Build
```bash
cd fhevm-vote-cast-frontend
npm run build
```

## 📦 Technologies

- **Smart Contracts**: Solidity ^0.8.24, FHEVM SDK
- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Ethers.js v6
- **Development**: Hardhat, TypeScript

## 🔒 Security Notes

- Never commit `.env` files or private keys
- Always verify contract addresses before use
- Test thoroughly on testnets before mainnet deployment
- Review FHEVM access control permissions carefully

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- [Zama](https://www.zama.ai/) for the FHEVM protocol
- FHEVM community for documentation and support

## 📧 Contact

For questions or issues, please open an issue on GitHub.

---

**Note**: This is a demonstration project showcasing FHEVM capabilities. Individual response data remains encrypted and private throughout the entire voting process.

