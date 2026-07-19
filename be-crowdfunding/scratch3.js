const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-amoy.infura.io/v3/05def212767b460ba9cfb8faadcd3296");
    const address = "0x0867685c1DB463b8c43f87449BCBc610467fA8Aa";
    
    try {
        const code = await provider.getCode(address);
        console.log(`Code at ${address} on Amoy:`, code === "0x" ? "EMPTY (Not Deployed Here)" : "EXISTS");
        
        const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
        const balance = await wallet.getBalance();
        console.log(`Balance of Hardhat Account #0 on Amoy:`, ethers.utils.formatEther(balance), "POL");
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
