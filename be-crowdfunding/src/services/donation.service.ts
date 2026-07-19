import { FilterQuery, Model } from "mongoose";
import { IDonations, DonationModel } from "../models/donationModel";
import { ethers } from "ethers";
import { campaignABI } from "../ABI/abi";
import dotenv from "dotenv";
dotenv.config();

// Define the provider and contract address
const provider = new ethers.providers.JsonRpcProvider(
  process.env.INFURA_KEY || ""
);
const contractAddress = process.env.CONTRACT_ADDRESS || "";

export class DonationService {
  private DonationModel: Model<IDonations>;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor(privateKey: string) {
    this.DonationModel = DonationModel;

    // Initialize wallet
    this.wallet = new ethers.Wallet(privateKey, provider);

    // Initialize contract with wallet
    this.contract = new ethers.Contract(
      contractAddress,
      campaignABI,
      this.wallet
    );
  }

  async withdrawDonation(CampaignID: string): Promise<string> {
    try {
      // ✅ Ambil harga gas saat ini dari jaringan
      const gasPrice = await this.wallet.provider.getGasPrice();

      // ✅ Tentukan gas fee yang sesuai
      const maxPriorityFeePerGas = gasPrice.mul(2);
      const maxFeePerGas = gasPrice.mul(3);

      // ✅ Kirim transaksi penarikan dana ke smart contract dengan gas yang cukup
      const tx = await this.contract.withdraw(CampaignID, {
        gasLimit: 250000, // 💡 Gunakan batas gas lebih tinggi
        maxPriorityFeePerGas,
        maxFeePerGas,
      });

      // ✅ Tunggu hingga transaksi dikonfirmasi di blockchain
      const receipt = await tx.wait();

      return receipt.transactionHash;
    } catch (error: any) {
      console.error("❌ ERROR: Withdrawal failed!", error);
      throw new Error(error.reason || "Transaction failed");
    }
  }

  async processRefund(CampaignID: string, DonorID: string, WalletAddress: string): Promise<string> {
    try {
      // Find all active donations by this user to this campaign
      const donations = await this.DonationModel.find({ CampaignID, DonorID, Deleted_at: { $exists: false } });
      
      let totalAmount = 0;
      for (const d of donations) {
          totalAmount += d.Amount;
      }
      
      if (totalAmount <= 0) {
          throw new Error("No refundable amount found");
      }

      const amountStr = totalAmount.toString();
      const amountInWei = ethers.utils.parseUnits(amountStr, "ether");

      const gasPrice = await this.wallet.provider.getGasPrice();
      const maxPriorityFeePerGas = gasPrice.mul(2);
      const maxFeePerGas = gasPrice.mul(3);

      // Call the refund function on the smart contract
      const tx = await this.contract.refund(CampaignID, WalletAddress, amountInWei, {
        gasLimit: 300000, 
        maxPriorityFeePerGas,
        maxFeePerGas,
      });

      const receipt = await tx.wait();

      // Mark these donations as deleted/refunded in the DB
      await this.DonationModel.updateMany(
          { CampaignID, DonorID, Deleted_at: { $exists: false } }, 
          { $set: { Deleted_at: new Date() } }
      );

      return receipt.transactionHash;
    } catch (error: any) {
      console.error("❌ ERROR: Refund failed!", error);
      throw new Error(error.reason || error.message || "Transaction failed");
    }
  }

  // Method to estimate gas for donations
  async estimateGasDonate(
    campaignId: string,
    amount: string,
    key: string,
    value: string
  ): Promise<ethers.BigNumber> {
    return await this.contract.estimateGas.donate(campaignId, amount, key, {
      value: ethers.BigNumber.from(value),
    });
  }

  /**
   * Donate to a campaign
   * @param campaignId - ID of the campaign
   * @param amount - Amount to donate in Wei
   * @param key - Key for the donation
   * @param valueInEther - Ether value to send with the donation
   * @returns The transaction object
   */
  // async donate(
  //   campaignId: number,
  //   amount: string,
  //   key: number,
  //   valueInEther: string,
  //   overrides: ethers.PayableOverrides = {}
  // ): Promise<ethers.providers.TransactionResponse> {
  //   try {
  //     // Periksa saldo sebelum donasi
  //     const campaignBefore = await this.contract.getCampaignById(campaignId);
  //     console.log(
  //       `🔍 Current Amount Sebelum Donasi: ${ethers.utils.formatEther(
  //         campaignBefore.currentAmount
  //       )}`
  //     );

  //     console.log("Fetching campaign details...");
  //     const campaigns = await this.contract.getCampaigns();
  //     console.log("Campaigns:", campaigns);

  //     console.log("Attempting to donate...");
  //     console.log("Amount in Wei:", amount);
  //     console.log("Value in Ether:", valueInEther);

  //     const tx = await this.contract.donate(
  //       campaignId,
  //       ethers.BigNumber.from(amount), // Convert amount to BigNumber if not already
  //       key,
  //       {
  //         value: ethers.utils.parseEther(valueInEther), // Convert Ether value
  //         ...overrides,
  //       }
  //     );

  //     console.log("Transaction sent. Waiting for confirmation...");
  //     const receipt = await tx.wait(); // Wait for transaction to be mined

  //     // Periksa saldo setelah donasi
  //     const campaignAfter = await this.contract.getCampaignById(campaignId);
  //     console.log(
  //       `✅ Current Amount Setelah Donasi: ${ethers.utils.formatEther(
  //         campaignAfter.currentAmount
  //       )}`
  //     );

  //     console.log(
  //       "Donation successful! Transaction hash:",
  //       receipt.transactionHash
  //     );
  //     return tx;
  //   } catch (error) {
  //     console.error("Error during donation:", error);
  //     throw error;
  //   }
  // }

  /**
   * Get the provider instance
   * @returns ethers.providers.JsonRpcProvider
   */
  getProvider(): ethers.providers.JsonRpcProvider {
    return provider;
  }

  // Add getWalletAddress method
  getWalletAddress(): string {
    return this.wallet.address;
  }

  async generateKey() {
    const result = await this.DonationModel.findOne({
      Key: { $exists: true },
    }).sort({ Key: -1 });

    if (result && result.Key) {
      return result.Key + 1;
    }

    return 1;
  }

  async getOneDonation(
    filter: FilterQuery<IDonations>
  ): Promise<IDonations | null> {
    const category = await this.DonationModel.findOne(filter);
    return category;
  }

  async getAllDonation() {
    try {
      const result = await this.DonationModel.find();
      if (!result) {
        return null;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async createDonation(body: IDonations): Promise<IDonations | null> {
    try {
      // const donation = await this.DonationModel.findOne({
      //   DonorID: body.DonorID,
      // });

      // if (donation) {
      //   return null;
      // }
      const key = await this.generateKey();

      const newDonation = new this.DonationModel({ ...body, Key: key });

      return await newDonation.save();
    } catch (error) {
      throw error;
    }
  }

  async updateDonation(id: string, body: IDonations) {
    try {
      const data = await this.DonationModel.findOne({
        _id: id,
      });
      if (!data) {
        return null;
      }

      body.Updated_at = new Date();

      const result = await this.DonationModel.findByIdAndUpdate(
        { _id: id },
        {
          ...body,
        },
        { new: true }
      ).exec();

      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteDonation(id: string) {
    try {
      const data = await this.DonationModel.findOne({ _id: id });
      if (!data) {
        return null;
      }

      const result = await this.DonationModel.findByIdAndUpdate(
        {
          _id: id,
        },
        {
          isDeleted: true,
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          new: true,
        }
      ).exec();

      return result;
    } catch (error) {
      throw error;
    }
  }
}
