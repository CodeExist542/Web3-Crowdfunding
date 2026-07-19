import { ethers } from "ethers";
import { Request, Response } from "express";
import { campaignABI } from "../ABI/abi";
import { CampaignService } from "../services/campaign.service";

import { newErrorResponse, newSuccessResponse } from "../utils/response";
import { IDonations } from "../models/donationModel";
import { UserService } from "../services/user.service";
import { DonationService } from "../services/donation.service";
import { PaymentService } from "../services/payment.service";
import { Types } from "mongoose";

export class DonationController {
  private CampaignService: CampaignService;
  private UserService: UserService;
  private DonationService: DonationService;
  private PaymentService: PaymentService;

  private contractAddress: string;
  private abi: any[];
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private contract: ethers.Contract;
  private contractById: ethers.Contract;
  private isProcessing: boolean = false;

  constructor(privateKey: string) {
    this.CampaignService = new CampaignService();
    this.UserService = new UserService();
    this.PaymentService = new PaymentService();
    this.DonationService = new DonationService(privateKey);

    this.contractAddress = `${process.env.CONTRACT_ADDRESS}`;
    this.abi = campaignABI;
    this.provider = new ethers.providers.JsonRpcProvider(
      `${process.env.INFURA_KEY}`
    );
    this.signer = new ethers.Wallet(`${process.env.PRIVATE_KEY}`);
    this.contract = new ethers.Contract(
      this.contractAddress,
      this.abi,
      this.signer
    );

    this.contractById = new ethers.Contract(
      this.contractAddress,
      this.abi,
      this.provider
    );
    // this.GetAllDonations = this.GetAllCampaigns.bind(this);
    this.CreateDonation = this.CreateDonation.bind(this);
    this.WithdrawDonation = this.WithdrawDonation.bind(this);
    this.RefundDonation = this.RefundDonation.bind(this);
    // this.GetCampaigns = this.GetCampaigns.bind(this);
    // this.CreateCampaign = this.CreateCampaign.bind(this);
    // this.UpdateCampaign = this.UpdateCampaign.bind(this);
    // this.DeleteCampaign = this.DeleteCampaign.bind(this);
  }

  async GetAllDonations(req: Request, res: Response) {
    try {
      const result = await this.DonationService.getAllDonation();

      if (!result) {
        res.status(400).json(newErrorResponse("Donation not found"));
      }

      res
        .status(200)
        .json(newSuccessResponse("Donation get successfully", result));
    } catch (error) {
      res.status(500).json(newErrorResponse("Error get all Donations"));
    }
  }

  async CreateDonation(req: Request, res: Response): Promise<void> {
    try {
      // **Initialize Blockchain Connection**
      const contractAddress = this.contractAddress;
      const abi = this.abi;
      const provider = this.provider;
      const signer = new ethers.Wallet(this.signer, provider);
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const contractById = new ethers.Contract(contractAddress, abi, provider);

      // **Extract Body Data**
      const body: IDonations = req.body;

      // **Validate User**
      const userID = await this.UserService.getOneUser({ Key: body.DonorID });

      if (!userID) {
        res
          .status(400)
          .json(newErrorResponse(`Owner with ID ${body.DonorID} not found`));
        return;
      }

      // **Validate Campaign**
      const campaignID = await this.CampaignService.getOneCampaign({
        Key: body.CampaignID,
      });
      if (!campaignID) {
        res
          .status(400)
          .json(
            newErrorResponse(`Campaign with ID ${body.CampaignID} not found`)
          );
        return;
      }

      // // **Validasi Campaign ID**
      // const totalCampaigns = await contract.getTotalCampaigns();
      // if (body.CampaignID >= totalCampaigns) {
      //   res.status(400).json({ message: "Invalid Campaign ID" });
      //   return;
      // }

      const campaignIDNumber = Number(body.CampaignID); // ✅ Pastikan campaignID berupa angka

      // **Convert TargetAmount to Wei**
      const amountStr = Number(body.Amount).toFixed(18);
      const amountInWei = ethers.utils.parseUnits(amountStr, "ether");

      // **Check Wallet Balance**
      const balance = await provider.getBalance(signer.address);

      if (balance.lt(ethers.utils.parseEther("0.01"))) {
        res
          .status(400)
          .json(newErrorResponse("Insufficient balance to create donations"));
        return;
      }

      const campaignDetails = await contractById.getCampaignByID(
        campaignIDNumber
      );

      // **Pastikan campaign ditemukan**
      if (
        !campaignDetails ||
        campaignDetails.owner === ethers.constants.AddressZero
      ) {
        res.status(400).json({
          message: `Campaign ID ${campaignIDNumber} not found on blockchain`,
        });
        return;
      }

      // **VALIDASI STATUS CAMPAIGN**
      const campaignStatus = campaignDetails.status;

      if (campaignStatus === "Completed") {
        const updateStatusCampaign =
          await this.CampaignService.updateStatusCampaign(
            campaignIDNumber.toString(),
            campaignStatus
          );

        if (!updateStatusCampaign) {
          res.status(400).json(
            newErrorResponse("Error updating campaign balance database", {
              campaignID: campaignIDNumber,
              updated: updateStatusCampaign,
            })
          );
          return;
        }
        res.status(400).json(
          newErrorResponse(
            "This campaign has already been completed. You cannot donate to a completed campaign.",
            {
              campaignID: campaignIDNumber,
              status: campaignStatus,
            }
          )
        );
        return;
      }

      // **Estimate Gas Usage**

      const gasEstimate = await contract.estimateGas.donate(
        body.CampaignID,
        amountInWei,
        {
          value: amountInWei, // ✅ Tambahkan value untuk estimasi gas
        }
      );

      const gasLimit = gasEstimate.mul(2);
      const gasPrice = await provider.getGasPrice();

      const transaction = await contract.donate(
        campaignIDNumber,
        amountInWei, // ✅ Jangan gunakan `.toString()`, tetap sebagai BigNumber
        {
          gasLimit,
          maxPriorityFeePerGas: ethers.utils.hexlify(gasPrice.mul(2)),
          maxFeePerGas: ethers.utils.hexlify(gasPrice.mul(3)),
          value: amountInWei,
        }
      );

      const receipt = await transaction.wait();

      const updateCampaignBalance =
        await this.CampaignService.updateOneCampaign(
          campaignIDNumber.toString(),
          parseFloat(amountStr)
        );

      if (!updateCampaignBalance) {
        res.status(400).json(
          newErrorResponse("Error updating campaign balance database", {
            campaignID: campaignIDNumber,
            updated: updateCampaignBalance,
          })
        );
        return;
      }

      const newDonation = await this.DonationService.createDonation({
        ...body,
      });

      if (!newDonation) {
        res.status(400).json(newErrorResponse("Error create new donations"));
        return;
      }

      const donationKey = newDonation?.Key; // Ensure body exists and Key is accessed safely

      if (donationKey === undefined) {
        throw new Error("Donation Key is missing from request body");
      }

      const newPayment = await this.PaymentService.createPayment({
        _id: new Types.ObjectId(),
        DonationID: newDonation.Key.toString(),
        Method: "SOL",
        isDeleted: false,
        Created_at: new Date(),
        Updated_at: new Date(),
      });

      if (!newPayment) {
        res.status(400).json(newErrorResponse("Error create new payment"));
        return;
      }

      // **Return Success Response**
      res
        .status(201)
        .json(newSuccessResponse("Donations created successfully", receipt));
    } catch (error: any) {
      console.error("🚨 Error creating donations:", error);

      if (error.reason) {
        res.status(500).json({
          message: `Smart contract execution failed: ${error.reason}`,
        });
        return;
      }

      res
        .status(500)
        .json(newErrorResponse("Error creating donations on blockchain"));
    }
  }

  async WithdrawDonation(req: Request, res: Response): Promise<void> {
    try {
      // ✅ Ambil CampaignID dari body request
      const { CampaignID } = req.body;

      // ✅ Validasi apakah CampaignID ada
      if (!CampaignID) {
        res.status(400).json(newErrorResponse("Campaign ID is required"));
        return;
      }

      // ✅ Panggil service untuk melakukan penarikan dana
      const result = await this.DonationService.withdrawDonation(CampaignID);

      if (!result) {
        res.status(400).json(newErrorResponse("Cannot get Campaign ID"));
        return;
      }

      // ✅ Kirimkan respon sukses dengan hash transaksi
      res
        .status(200)
        .json(newSuccessResponse("Successfully withdrawal ", result));
    } catch (error: any) {
      console.error("🚨 Error during withdrawal:", error);

      if (error.reason) {
        // Send more specific error if it's coming from the smart contract
        res.status(500).json({
          message: `Smart contract execution failed: ${error.reason}`,
        });
      } else {
        // Default fallback error message
        res.status(500).json({
          message: "Error withdrawing donation from blockchain",
        });
      }
    }
  }

  async RefundDonation(req: Request, res: Response): Promise<void> {
    try {
      const { CampaignID, DonorID } = req.body;

      if (!CampaignID || !DonorID) {
        res.status(400).json(newErrorResponse("Campaign ID and Donor ID are required"));
        return;
      }

      const user = await this.UserService.getOneUser({ Key: DonorID });
      if (!user || !user.WalletAddress) {
        res.status(400).json(newErrorResponse("Donor or donor wallet not found"));
        return;
      }

      const result = await this.DonationService.processRefund(CampaignID.toString(), DonorID.toString(), user.WalletAddress.toString());

      res.status(200).json(newSuccessResponse("Successfully refunded", result));
    } catch (error: any) {
      console.error("🚨 Error during refund:", error);
      if (error.message === "No refundable amount found") {
         res.status(400).json(newErrorResponse(error.message));
         return;
      }
      res.status(500).json(newErrorResponse(error.reason || error.message || "Error processing refund"));
    }
  }
}
