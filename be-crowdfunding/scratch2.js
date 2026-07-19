const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-amoy.infura.io/v3/05def212767b460ba9cfb8faadcd3296");
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contractAddress = "0x1b5154B627E171210e2c9975003D32c95F5481a5";
    
    const abi = [
        "function getCampaignByID(uint256) view returns (uint256, address, string, string, uint256 targetAmount, uint256 currentAmount, uint256, string status)",
        "function donate(uint256, uint256) payable"
    ];
    
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    try {
        const camp = await contract.getCampaignByID(1);
        const target = camp.targetAmount;
        const current = camp.currentAmount;
        const status = camp.status;
        
        console.log(`Campaign 1 Status on Blockchain: ${status}`);
        if (status !== "Completed") {
            const diff = target.sub(current);
            if (diff.gt(0)) {
                console.log(`Donating ${ethers.utils.formatEther(diff)} POL to force completion...`);
                
                const tx = await contract.donate(1, diff, {
                    value: diff,
                    gasLimit: 300000
                });
                console.log("Tx Hash:", tx.hash);
                await tx.wait();
                console.log("Forced completion successful!");
            }
        } else {
            console.log("Already completed!");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
