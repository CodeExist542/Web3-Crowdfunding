"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
async function main() {
    const Donation = await hardhat_1.ethers.getContractFactory("Donation");
    const donation = await Donation.deploy();
    await donation.deployed();
    console.log(`Donation contract deployed to: ${donation.address}`);
}
main().catch((error) => {
    console.error("prosesError: ", error);
    process.exitCode = 1;
});
