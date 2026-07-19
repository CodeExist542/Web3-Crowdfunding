// src/constants/contract.ts
export const CONTRACT_ADDRESS = "0x29431551750b20D89f5ee6d0609Aa08b32Ed90E6";

export const CONTRACT_ABI = [
  "function donate(uint256 campaignId) public payable",
  "function getCampaigns() public view returns (tuple(address owner, string title, string description, uint256 targetAmount, uint256 currentAmount, uint256 deadline, string status)[])",
];