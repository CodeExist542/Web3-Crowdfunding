const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

async function main() {
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-amoy.infura.io/v3/05def212767b460ba9cfb8faadcd3296");
    const contractAddress = "0x0867685c1DB463b8c43f87449BCBc610467fA8Aa";
    
    // Minimal ABI to read
    const abi = [
        "function getCampaignByID(uint256 _campaignID) view returns (uint256 id, address owner, string title, string description, uint256 targetAmount, uint256 currentAmount, uint256 deadline, string status)",
        "function campaignCount() view returns (uint256)",
        "function withdraw(uint256) public"
    ];
    
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    try {
        const count = await contract.campaignCount();
        console.log("Campaign Count:", count.toString());
        
        for (let i = 1; i < count; i++) {
            const camp = await contract.getCampaignByID(i);
            console.log(`Campaign ${i}:`);
            console.log(`  Owner: ${camp.owner}`);
            console.log(`  Target: ${ethers.utils.formatEther(camp.targetAmount)} POL`);
            console.log(`  Current: ${ethers.utils.formatEther(camp.currentAmount)} POL`);
            console.log(`  Status: '${camp.status}'`);
        }

        // Try to estimate gas for withdraw
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const contractWithSigner = contract.connect(signer);
        
        console.log("\nAttempting to estimate gas for withdraw(1)...");
        try {
            const gas = await contractWithSigner.estimateGas.withdraw(1);
            console.log("Gas Estimate:", gas.toString());
        } catch (e) {
            console.error("Gas Estimate Failed:", e.message || e);
        }
        
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
