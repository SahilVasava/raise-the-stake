const hre = require("hardhat");

async function main() {
  const RaiseTheStakeFactory = await ethers.getContractFactory("RaiseTheStake");
  const rts = await RaiseTheStakeFactory.deploy();
  await rts.deployed();

  console.log("RaiseTheStake deployed to:", rts.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
