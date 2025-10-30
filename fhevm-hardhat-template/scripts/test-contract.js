const { ethers } = require("hardhat");

async function main() {
  console.log("Testing FHEVoteCast contract...");

  // Get the contract
  const FHEVoteCast = await ethers.getContract("FHEVoteCast");
  console.log("Contract address:", await FHEVoteCast.getAddress());

  // Test getNextSurveyId
  const nextId = await FHEVoteCast.getNextSurveyId();
  console.log("Next survey ID:", nextId);

  console.log("✅ Contract is accessible!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

