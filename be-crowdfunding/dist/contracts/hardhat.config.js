"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomiclabs/hardhat-ethers");
const config = {
    solidity: "0.8.0",
    networks: {
        polygon: {
            url: "https://polygon-amoy.infura.io/v3/05def212767b460ba9cfb8faadcd3296", // Ganti dengan RPC Polygon Amoy Anda
            accounts: [
                `0x8ab9112a1b61ca58db7268b4b96143f3b2660e526b826ce6af5c696ceaf1ac6e`,
            ], // Private key tanpa `0x` di depan
        },
    },
    paths: {
        sources: "../../src/contracts", // Path ke folder yang berisi file .sol
    },
};
exports.default = config;
