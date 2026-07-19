import { campaignABI } from "../ABI/abi";
import { CampaignService } from "../services/campaign.service";
import { BigNumber, ethers } from "ethers";
import { Request, Response } from "express";
import { newErrorResponse, newSuccessResponse } from "../utils/response";
import { ICampaigns } from "../models/campaignModel";
import { UserService } from "../services/user.service";

export class CampaignController {
  private CampaignService: CampaignService;
  private UserService: UserService;

  private contractAddress: string;
  private abi: any[];
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private contract: ethers.Contract;

  constructor() {
    this.CampaignService = new CampaignService();
    this.UserService = new UserService();

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

    this.GetAllCampaigns = this.GetAllCampaigns.bind(this);
    this.GetAllCampaignsById = this.GetAllCampaignsById.bind(this);
    this.GetCampaigns = this.GetCampaigns.bind(this);
    this.CreateCampaign = this.CreateCampaign.bind(this);
    this.UpdateCampaign = this.UpdateCampaign.bind(this);
    this.CancelCampaign = this.CancelCampaign.bind(this);
    this.DeleteCampaign = this.DeleteCampaign.bind(this);
  }

   async GetAllCampaigns(req: Request, res: Response) {
    try {
      // Baca parameter dari query string dengan nilai default
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;
      const sort = req.query.sort ? (req.query.sort as string) : "-Created_at"; // Perbaikan nama field
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      
      // ✅ BARU: Baca parameter pencarian
      const search = req.query.search ? (req.query.search as string) : "";

      // Panggil service dengan semua parameter
      const result = await this.CampaignService.getFilteredCampaigns({
        limit,
        sort,
        page,
        search, // ✅ BARU: Teruskan parameter search ke service
      });

      // Kirim respons sukses dengan data yang diterima dari service
      res
        .status(200)
        .json(newSuccessResponse("Campaigns retrieved successfully", result));

    } catch (error) {
      console.error("Error getting all Campaigns:", error); // Tambahkan log untuk debugging
      res.status(500).json(newErrorResponse("Error getting all Campaigns"));
    }
  }

   // ✅ BARU: Metode controller untuk mendapatkan campaign milik user yang login
  async GetMyCampaigns(req: Request, res: Response) {
    try {
      // Asumsi: middleware otentikasi menaruh data user di req.user
      const userKey = (req as any).user?.Key; 

      if (!userKey) {
        return res.status(401).json(newErrorResponse("User not authenticated or Key not found in token"));
      }

      const campaigns = await this.CampaignService.getCampaignsByOwner(userKey);

      res
        .status(200)
        .json(newSuccessResponse("User campaigns retrieved successfully", campaigns));

    } catch (error) {
      res.status(500).json(newErrorResponse("Error retrieving user campaigns"));
    }
  }

  async GetAllCampaignsById(req: Request, res: Response) {
    try {
      const { id } = req.params; // Mengambil ID langsung dari req.params

      if (!id) {
        res.status(400).json(newErrorResponse("ID is missing in request"));
        return;
      }

      const result = await this.CampaignService.getCampaignById(id); // Menggunakan id langsung

      if (!result) {
        res.status(404).json(newErrorResponse("Campaign not found"));
        return;
      }

      res
        .status(200)
        .json(newSuccessResponse("Campaign retrieved successfully", result));
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json(newErrorResponse("Error fetching campaign"));
    }
  }

  async GetCampaigns(req: Request, res: Response) {
    try {
      const result = await this.CampaignService.getCampaign();

      if (!result) {
        res.status(400).json(newErrorResponse("Campaign not found"));
        return;
      }
      res
        .status(200)
        .json(newSuccessResponse("Campaign get successfully", result));
    } catch (error) {
      res.status(500).json(newErrorResponse("Error get all Campaigns"));
    }
  }

  async CreateCampaign(req: Request, res: Response): Promise<void> {
    try {
      // **Handle File Upload**
      if (!req.file) {
        res.status(400).json({ message: "Image is required" });
        return;
      }
      const imagePath = req.file.path; // Path gambar lengkap dari Cloudinary

      // **Initialize Blockchain Connection**
      const contractAddress = this.contractAddress;
      const abi = this.abi;
      const provider = this.provider;
      const signer = new ethers.Wallet(this.signer, provider);
      const contract = new ethers.Contract(contractAddress, abi, signer);

      // **Extract Body Data**
      const body: ICampaigns = req.body;

      // **Validate User**
      const userID = await this.UserService.getOneUser({ Key: body.OwnerID });
      if (!userID) {
        res
          .status(400)
          .json(newErrorResponse(`Owner with ID ${body.OwnerID} not found`));
        return;
      }

      // **Check If Smart Contract Exists**
      const code = await provider.getCode(contractAddress);
      if (code === "0x") {
        res
          .status(400)
          .json({ message: "Smart Contract not deployed on network" });
        return;
      }

      // **Convert TargetAmount to Wei**
      const amountStr = Number(body.TargetAmount).toFixed(18);
      const amountInWei = ethers.utils.parseUnits(amountStr, "ether");

      // **Convert Deadline to UNIX Timestamp**
      const deadlineTimestamp = Math.floor(
        new Date(body.Deadline).getTime() / 1000
      );

      if (deadlineTimestamp < Math.floor(Date.now() / 1000)) {
        res
          .status(400)
          .json(newErrorResponse("Error: Deadline must be in the future"));
        return;
      }

      // **Check Wallet Balance**
      const balance = await provider.getBalance(signer.address);

      if (balance.lt(ethers.utils.parseEther("0.01"))) {
        res
          .status(400)
          .json(newErrorResponse("Insufficient balance to create campaign"));
        return;
      }

      // **Estimate Gas Usage**
      const gasEstimate = await contract.estimateGas.createCampaign(
        body.Title,
        body.Description,
        amountInWei,
        deadlineTimestamp,
        body.Status
      );

      const gasLimit = gasEstimate.mul(2);
      const gasPrice = await provider.getGasPrice();

      // **Send Transaction**
      const tx = await contract.createCampaign(
        body.Title,
        body.Description,
        amountInWei,
        deadlineTimestamp,
        body.Status,
        {
          gasLimit: gasLimit,
          maxPriorityFeePerGas: ethers.utils.hexlify(gasPrice.mul(2)),
          maxFeePerGas: ethers.utils.hexlify(gasPrice.mul(3)),
        }
      );

      const receipt = await tx.wait();

      // **Get Event `CampaignCreated`**
      const event = receipt.events?.find(
        (e: any) => e.event === "CampaignCreated"
      );
      if (!event) {
        res
          .status(500)
          .json(
            newErrorResponse(
              "Error: Campaign creation event not found in transaction"
            )
          );
        return;
      }

      const campaignId = event.args[0].toNumber();

      // **Save to Database**
      const result = await this.CampaignService.createCampaign({
        ...body,
        Image: imagePath, // Simpan path gambar
      });

      if (!result) {
        res
          .status(400)
          .json(
            newErrorResponse(`Campaign with name ${body.Title} already exists`)
          );
        return;
      }

      // **Return Success Response**
      res
        .status(201)
        .json(newSuccessResponse("Campaign created successfully", campaignId));
    } catch (error: any) {
      console.error("🚨 Error creating campaign:", error);

      if (error.reason) {
        res.status(500).json({
          message: `Smart contract execution failed: ${error.reason}`,
        });
      }

      res
        .status(500)
        .json(newErrorResponse("Error creating campaign on blockchain"));
    }
  }

  async UpdateCampaign(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const body: ICampaigns = req.body;

      const result = await this.CampaignService.updateCampaign(id, {
        ...body,
      });
      if (!result) {
        res
          .status(403)
          .json(
            newErrorResponse(`Campaign with title ${body.Title} not found`)
          );
        return;
      }

      res.status(200).json(newSuccessResponse("Update Campaign succesfully"));
    } catch (error) {}
  }

  async CancelCampaign(req: Request, res: Response): Promise<void> {
    try {
      const { CampaignID } = req.body;
      const userKey = (req as any).user?.Key; // from authenticateToken

      if (!CampaignID) {
        res.status(400).json(newErrorResponse("Campaign ID is required"));
        return;
      }

      // 1. Verifikasi campaign ada dan milik user
      const campaign = await this.CampaignService.getOneCampaign({ Key: CampaignID });
      if (!campaign) {
        res.status(404).json(newErrorResponse("Campaign not found"));
        return;
      }

      // OwnerID di DB mungkin string atau number
      if (campaign.OwnerID?.toString() !== userKey?.toString()) {
         res.status(403).json(newErrorResponse("You are not the owner of this campaign"));
         return;
      }

      if (campaign.Status !== "Active") {
         res.status(400).json(newErrorResponse("Only Active campaigns can be cancelled"));
         return;
      }

      // 2. Eksekusi Smart Contract
      const signer = new ethers.Wallet(`${process.env.PRIVATE_KEY}`, this.provider);
      const contract = new ethers.Contract(this.contractAddress, this.abi, signer);

      const gasPrice = await this.provider.getGasPrice();
      const maxPriorityFeePerGas = gasPrice.mul(2);
      const maxFeePerGas = gasPrice.mul(3);

      const tx = await contract.cancelCampaign(CampaignID, {
        gasLimit: 300000,
        maxPriorityFeePerGas,
        maxFeePerGas,
      });

      const receipt = await tx.wait();

      // 3. Update Database
      await this.CampaignService.updateStatusCampaign(CampaignID.toString(), "Cancelled");

      res.status(200).json(newSuccessResponse("Campaign cancelled successfully", receipt.transactionHash));
    } catch (error: any) {
      console.error("🚨 Error cancelling campaign:", error);
      res.status(500).json(newErrorResponse(error.reason || error.message || "Error cancelling campaign on blockchain"));
    }
  }

  async DeleteCampaign(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.CampaignService.deleteCampaign(id);
      if (!result) {
        res
          .status(403)
          .json(newErrorResponse(`Campaign with _id ${id} not found`));
      }

      res.status(200).json(newSuccessResponse("Delete Campaign succesfully"));
    } catch (error) {
      res.status(500).json(newErrorResponse("Error delete Campaign"));
    }
  }
}
