"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignController = void 0;
const abi_1 = require("../ABI/abi");
const campaign_service_1 = require("../services/campaign.service");
const ethers_1 = require("ethers");
const response_1 = require("../utils/response");
const user_service_1 = require("../services/user.service");
class CampaignController {
    constructor() {
        this.CampaignService = new campaign_service_1.CampaignService();
        this.UserService = new user_service_1.UserService();
        this.contractAddress = `${process.env.CONTRACT_ADDRESS}`;
        this.abi = abi_1.campaignABI;
        this.provider = new ethers_1.ethers.providers.JsonRpcProvider(`${process.env.INFURA_KEY}`);
        this.signer = new ethers_1.ethers.Wallet(`${process.env.PRIVATE_KEY}`);
        this.contract = new ethers_1.ethers.Contract(this.contractAddress, this.abi, this.signer);
        this.GetAllCampaigns = this.GetAllCampaigns.bind(this);
        this.GetAllCampaignsById = this.GetAllCampaignsById.bind(this);
        this.GetCampaigns = this.GetCampaigns.bind(this);
        this.CreateCampaign = this.CreateCampaign.bind(this);
        this.UpdateCampaign = this.UpdateCampaign.bind(this);
        this.CancelCampaign = this.CancelCampaign.bind(this);
        this.DeleteCampaign = this.DeleteCampaign.bind(this);
    }
    async GetAllCampaigns(req, res) {
        try {
            // Baca parameter dari query string dengan nilai default
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 6;
            const sort = req.query.sort ? req.query.sort : "-Created_at"; // Perbaikan nama field
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            // ✅ BARU: Baca parameter pencarian
            const search = req.query.search ? req.query.search : "";
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
                .json((0, response_1.newSuccessResponse)("Campaigns retrieved successfully", result));
        }
        catch (error) {
            console.error("Error getting all Campaigns:", error); // Tambahkan log untuk debugging
            res.status(500).json((0, response_1.newErrorResponse)("Error getting all Campaigns"));
        }
    }
    // ✅ BARU: Metode controller untuk mendapatkan campaign milik user yang login
    async GetMyCampaigns(req, res) {
        var _a;
        try {
            // Asumsi: middleware otentikasi menaruh data user di req.user
            const userKey = (_a = req.user) === null || _a === void 0 ? void 0 : _a.Key;
            if (!userKey) {
                return res.status(401).json((0, response_1.newErrorResponse)("User not authenticated or Key not found in token"));
            }
            const campaigns = await this.CampaignService.getCampaignsByOwner(userKey);
            res
                .status(200)
                .json((0, response_1.newSuccessResponse)("User campaigns retrieved successfully", campaigns));
        }
        catch (error) {
            res.status(500).json((0, response_1.newErrorResponse)("Error retrieving user campaigns"));
        }
    }
    async GetAllCampaignsById(req, res) {
        try {
            const { id } = req.params; // Mengambil ID langsung dari req.params
            if (!id) {
                res.status(400).json((0, response_1.newErrorResponse)("ID is missing in request"));
                return;
            }
            const result = await this.CampaignService.getCampaignById(id); // Menggunakan id langsung
            if (!result) {
                res.status(404).json((0, response_1.newErrorResponse)("Campaign not found"));
                return;
            }
            res
                .status(200)
                .json((0, response_1.newSuccessResponse)("Campaign retrieved successfully", result));
        }
        catch (error) {
            console.error("Error fetching campaign:", error);
            res.status(500).json((0, response_1.newErrorResponse)("Error fetching campaign"));
        }
    }
    async GetCampaigns(req, res) {
        try {
            const result = await this.CampaignService.getCampaign();
            if (!result) {
                res.status(400).json((0, response_1.newErrorResponse)("Campaign not found"));
                return;
            }
            res
                .status(200)
                .json((0, response_1.newSuccessResponse)("Campaign get successfully", result));
        }
        catch (error) {
            res.status(500).json((0, response_1.newErrorResponse)("Error get all Campaigns"));
        }
    }
    async CreateCampaign(req, res) {
        var _a;
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
            const signer = new ethers_1.ethers.Wallet(this.signer, provider);
            const contract = new ethers_1.ethers.Contract(contractAddress, abi, signer);
            // **Extract Body Data**
            const body = req.body;
            // **Validate User**
            const userID = await this.UserService.getOneUser({ Key: body.OwnerID });
            if (!userID) {
                res
                    .status(400)
                    .json((0, response_1.newErrorResponse)(`Owner with ID ${body.OwnerID} not found`));
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
            const amountInWei = ethers_1.ethers.utils.parseUnits(amountStr, "ether");
            // **Convert Deadline to UNIX Timestamp**
            const deadlineTimestamp = Math.floor(new Date(body.Deadline).getTime() / 1000);
            if (deadlineTimestamp < Math.floor(Date.now() / 1000)) {
                res
                    .status(400)
                    .json((0, response_1.newErrorResponse)("Error: Deadline must be in the future"));
                return;
            }
            // **Check Wallet Balance**
            const balance = await provider.getBalance(signer.address);
            if (balance.lt(ethers_1.ethers.utils.parseEther("0.01"))) {
                res
                    .status(400)
                    .json((0, response_1.newErrorResponse)("Insufficient balance to create campaign"));
                return;
            }
            // **Estimate Gas Usage**
            const gasEstimate = await contract.estimateGas.createCampaign(body.Title, body.Description, amountInWei, deadlineTimestamp, body.Status);
            const gasLimit = gasEstimate.mul(2);
            const gasPrice = await provider.getGasPrice();
            // **Send Transaction**
            const tx = await contract.createCampaign(body.Title, body.Description, amountInWei, deadlineTimestamp, body.Status, {
                gasLimit: gasLimit,
                maxPriorityFeePerGas: ethers_1.ethers.utils.hexlify(gasPrice.mul(2)),
                maxFeePerGas: ethers_1.ethers.utils.hexlify(gasPrice.mul(3)),
            });
            const receipt = await tx.wait();
            // **Get Event `CampaignCreated`**
            const event = (_a = receipt.events) === null || _a === void 0 ? void 0 : _a.find((e) => e.event === "CampaignCreated");
            if (!event) {
                res
                    .status(500)
                    .json((0, response_1.newErrorResponse)("Error: Campaign creation event not found in transaction"));
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
                    .json((0, response_1.newErrorResponse)(`Campaign with name ${body.Title} already exists`));
                return;
            }
            // **Return Success Response**
            res
                .status(201)
                .json((0, response_1.newSuccessResponse)("Campaign created successfully", campaignId));
        }
        catch (error) {
            console.error("🚨 Error creating campaign:", error);
            if (error.reason) {
                res.status(500).json({
                    message: `Smart contract execution failed: ${error.reason}`,
                });
            }
            res
                .status(500)
                .json((0, response_1.newErrorResponse)("Error creating campaign on blockchain"));
        }
    }
    async UpdateCampaign(req, res) {
        try {
            const { id } = req.params;
            const body = req.body;
            const result = await this.CampaignService.updateCampaign(id, {
                ...body,
            });
            if (!result) {
                res
                    .status(403)
                    .json((0, response_1.newErrorResponse)(`Campaign with title ${body.Title} not found`));
                return;
            }
            res.status(200).json((0, response_1.newSuccessResponse)("Update Campaign succesfully"));
        }
        catch (error) { }
    }
    async CancelCampaign(req, res) {
        var _a, _b;
        try {
            const { CampaignID } = req.body;
            const userKey = (_a = req.user) === null || _a === void 0 ? void 0 : _a.Key; // from authenticateToken
            if (!CampaignID) {
                res.status(400).json((0, response_1.newErrorResponse)("Campaign ID is required"));
                return;
            }
            // 1. Verifikasi campaign ada dan milik user
            const campaign = await this.CampaignService.getOneCampaign({ Key: CampaignID });
            if (!campaign) {
                res.status(404).json((0, response_1.newErrorResponse)("Campaign not found"));
                return;
            }
            // OwnerID di DB mungkin string atau number
            if (((_b = campaign.OwnerID) === null || _b === void 0 ? void 0 : _b.toString()) !== (userKey === null || userKey === void 0 ? void 0 : userKey.toString())) {
                res.status(403).json((0, response_1.newErrorResponse)("You are not the owner of this campaign"));
                return;
            }
            if (campaign.Status !== "Active") {
                res.status(400).json((0, response_1.newErrorResponse)("Only Active campaigns can be cancelled"));
                return;
            }
            // 2. Eksekusi Smart Contract
            const signer = new ethers_1.ethers.Wallet(`${process.env.PRIVATE_KEY}`, this.provider);
            const contract = new ethers_1.ethers.Contract(this.contractAddress, this.abi, signer);
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
            res.status(200).json((0, response_1.newSuccessResponse)("Campaign cancelled successfully", receipt.transactionHash));
        }
        catch (error) {
            console.error("🚨 Error cancelling campaign:", error);
            res.status(500).json((0, response_1.newErrorResponse)(error.reason || error.message || "Error cancelling campaign on blockchain"));
        }
    }
    async DeleteCampaign(req, res) {
        try {
            const { id } = req.params;
            const result = await this.CampaignService.deleteCampaign(id);
            if (!result) {
                res
                    .status(403)
                    .json((0, response_1.newErrorResponse)(`Campaign with _id ${id} not found`));
            }
            res.status(200).json((0, response_1.newSuccessResponse)("Delete Campaign succesfully"));
        }
        catch (error) {
            res.status(500).json((0, response_1.newErrorResponse)("Error delete Campaign"));
        }
    }
}
exports.CampaignController = CampaignController;
